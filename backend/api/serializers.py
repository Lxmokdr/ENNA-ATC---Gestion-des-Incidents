from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, HardwareIncident, SoftwareIncident, Report, Equipement
from django.utils import timezone
from datetime import datetime


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Identifiants invalides')
            if not user.is_active:
                raise serializers.ValidationError('Compte utilisateur désactivé')
        else:
            raise serializers.ValidationError('Nom d\'utilisateur et mot de passe requis')
        
        attrs['user'] = user
        return attrs


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = ['id', 'num_serie', 'nom_equipement', 'partition', 'etat', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HardwareIncidentSerializer(serializers.ModelSerializer):
    incident_type = serializers.SerializerMethodField()
    equipment = serializers.SerializerMethodField()
    
    class Meta:
        model = HardwareIncident
        fields = [
            'id', 'incident_type', 'date', 'time', 'nom_de_equipement', 'partition',
            'numero_de_serie', 'equipement_id', 'equipment', 'description',
            'anomalie_observee', 'action_realisee', 'piece_de_rechange_utilisee',
            'etat_de_equipement_apres_intervention', 'recommendation', 'duree_arret',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_incident_type(self, obj):
        return 'hardware'
    
    def get_equipment(self, obj):
        if obj.equipement_id:
            try:
                equip = Equipement.objects.get(id=obj.equipement_id)
                return {
                    'id': equip.id,
                    'nom_equipement': equip.nom_equipement,
                    'partition': equip.partition,
                    'num_serie': equip.num_serie
                }
            except Equipement.DoesNotExist:
                return None
        return None
    
    def validate(self, attrs):
        # Set default date and time if not provided (using UTC/GMT)
        # timezone.now() returns UTC time when USE_TZ=True and TIME_ZONE='UTC'
        if 'date' not in attrs:
            attrs['date'] = timezone.now().date()  # UTC date
        if 'time' not in attrs:
            now = timezone.now()  # UTC datetime
            attrs['time'] = now.time()  # UTC time component (HH:MM:SS)
        return attrs


class SoftwareIncidentSerializer(serializers.ModelSerializer):
    incident_type = serializers.SerializerMethodField()
    
    class Meta:
        model = SoftwareIncident
        fields = [
            'id', 'incident_type', 'date', 'time', 'simulateur', 'salle_operationnelle',
            'server', 'game', 'partition', 'group', 'exercice', 'secteur',
            'position_STA', 'position_logique', 'type_d_anomalie', 'indicatif',
            'mode_radar', 'FL', 'longitude', 'latitude', 'code_SSR', 'sujet',
            'description', 'commentaires', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_incident_type(self, obj):
        return 'software'
    
    def validate(self, attrs):
        # Set default date and time if not provided (using UTC/GMT)
        # timezone.now() returns UTC time when USE_TZ=True and TIME_ZONE='UTC'
        if 'date' not in attrs:
            attrs['date'] = timezone.now().date()  # UTC date
        if 'time' not in attrs:
            now = timezone.now()  # UTC datetime
            attrs['time'] = now.time()  # UTC time component (HH:MM:SS)
        return attrs


class ReportSerializer(serializers.ModelSerializer):
    incident = serializers.IntegerField(source='software_incident.id', read_only=True)
    incident_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'incident', 'incident_type', 'date', 'time',
            'anomaly', 'analysis', 'conclusion', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_incident_type(self, obj):
        return 'software'
    
    def create(self, validated_data):
        software_incident_id = self.initial_data.get('incident')
        if not software_incident_id:
            raise serializers.ValidationError('Incident logiciel requis')
        
        try:
            software_incident = SoftwareIncident.objects.get(id=software_incident_id)
        except SoftwareIncident.DoesNotExist:
            raise serializers.ValidationError('Incident logiciel non trouvé. Les rapports ne peuvent être créés que pour les incidents logiciels.')
        
        # Determine anomaly value - use provided or fallback to incident description
        provided_anomaly = self.initial_data.get('anomaly', '').strip() if self.initial_data.get('anomaly') else ''
        anomaly = provided_anomaly if provided_anomaly else (software_incident.description or '')
        
        # Check if report already exists
        report, created = Report.objects.get_or_create(
            software_incident=software_incident,
            defaults={
                'date': software_incident.date,
                'time': software_incident.time,
                'anomaly': anomaly,
                'analysis': validated_data.get('analysis', ''),
                'conclusion': validated_data.get('conclusion', ''),
            }
        )
        
        if not created:
            # Update existing report
            update_anomaly = provided_anomaly if provided_anomaly else (software_incident.description or report.anomaly or '')
            report.anomaly = update_anomaly
            report.analysis = validated_data.get('analysis', report.analysis)
            report.conclusion = validated_data.get('conclusion', report.conclusion)
            report.date = software_incident.date
            report.time = software_incident.time
            report.save()
        
        return report

