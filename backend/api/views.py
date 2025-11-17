from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import timedelta
from .models import User, HardwareIncident, SoftwareIncident, Report, Equipement
from .serializers import (
    UserSerializer, LoginSerializer, HardwareIncidentSerializer,
    SoftwareIncidentSerializer, ReportSerializer, EquipmentSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'OK', 'message': 'ENNA Backend is running'})


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        
        user_data = UserSerializer(user).data
        return Response({
            'token': token,
            'user': user_data,
            'message': 'Connexion réussie'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint"""
    return Response({'message': 'Déconnexion réussie'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class IncidentViewSet(viewsets.ModelViewSet):
    """ViewSet for handling incidents"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        incident_type = self.request.query_params.get('type')
        
        if incident_type == 'hardware':
            return HardwareIncident.objects.select_related().all()
        elif incident_type == 'software':
            return SoftwareIncident.objects.all()
        else:
            # Return both types - we'll handle this in list method
            return None
    
    def list(self, request):
        """List incidents with optional type filter"""
        incident_type = request.query_params.get('type')
        
        if incident_type == 'hardware':
            incidents = HardwareIncident.objects.all()
            serializer = HardwareIncidentSerializer(incidents, many=True)
            return Response({'results': serializer.data, 'count': len(serializer.data)})
        elif incident_type == 'software':
            incidents = SoftwareIncident.objects.all()
            serializer = SoftwareIncidentSerializer(incidents, many=True)
            return Response({'results': serializer.data, 'count': len(serializer.data)})
        else:
            # Get both types
            hardware_incidents = HardwareIncident.objects.all()
            software_incidents = SoftwareIncident.objects.all()
            
            hardware_data = HardwareIncidentSerializer(hardware_incidents, many=True).data
            software_data = SoftwareIncidentSerializer(software_incidents, many=True).data
            
            all_incidents = hardware_data + software_data
            return Response({'results': all_incidents, 'count': len(all_incidents)})
    
    def create(self, request):
        """Create a new incident"""
        incident_type = request.data.get('incident_type')
        
        if incident_type == 'hardware':
            # Handle equipment lookup
            numero_de_serie = request.data.get('numero_de_serie', '').strip() if request.data.get('numero_de_serie') else ''
            equipement_id = None
            
            if numero_de_serie:
                # Try to find equipment with etat='actuel' first
                equip = Equipement.objects.filter(
                    num_serie__iexact=numero_de_serie,
                    etat='actuel'
                ).order_by('-created_at').first()
                
                if not equip:
                    # Try without etat condition
                    equip = Equipement.objects.filter(
                        num_serie__iexact=numero_de_serie
                    ).order_by('-created_at').first()
                
                if equip:
                    equipement_id = equip.id
            
            data = request.data.copy()
            data['equipement_id'] = equipement_id
            
            serializer = HardwareIncidentSerializer(data=data)
            if serializer.is_valid():
                # Validate required fields
                nom_equipement = serializer.validated_data.get('nom_de_equipement', '')
                description = serializer.validated_data.get('description', '')
                
                if not nom_equipement or (isinstance(nom_equipement, str) and not nom_equipement.strip()):
                    return Response(
                        {'message': 'Le nom de l\'équipement est requis'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if not description or (isinstance(description, str) and not description.strip()):
                    return Response(
                        {'message': 'La description est requise'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                incident = serializer.save()
                return Response(
                    HardwareIncidentSerializer(incident).data,
                    status=status.HTTP_201_CREATED
                )
            # Return detailed validation errors
            return Response(
                {'message': 'Erreur de validation', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        elif incident_type == 'software':
            serializer = SoftwareIncidentSerializer(data=request.data)
            if serializer.is_valid():
                # Validate required fields
                description = serializer.validated_data.get('description', '')
                if not description or (isinstance(description, str) and not description.strip()):
                    return Response(
                        {'message': 'La description est requise'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                incident = serializer.save()
                return Response(
                    SoftwareIncidentSerializer(incident).data,
                    status=status.HTTP_201_CREATED
                )
            # Return detailed validation errors
            return Response(
                {'message': 'Erreur de validation', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        else:
            return Response(
                {'message': 'Type d\'incident invalide. Utilisez "hardware" ou "software".'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def retrieve(self, request, pk=None):
        """Get a single incident"""
        # Try hardware first
        try:
            incident = HardwareIncident.objects.get(pk=pk)
            serializer = HardwareIncidentSerializer(incident)
            return Response(serializer.data)
        except HardwareIncident.DoesNotExist:
            try:
                incident = SoftwareIncident.objects.get(pk=pk)
                serializer = SoftwareIncidentSerializer(incident)
                return Response(serializer.data)
            except SoftwareIncident.DoesNotExist:
                return Response(
                    {'message': 'Incident non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
    
    def update(self, request, pk=None):
        """Update an incident - generic handler"""
        # Try hardware first
        try:
            incident = HardwareIncident.objects.get(pk=pk)
            # Handle equipment lookup
            numero_de_serie = request.data.get('numero_de_serie', '').strip() if request.data.get('numero_de_serie') else ''
            equipement_id = None
            
            if numero_de_serie:
                equip = Equipement.objects.filter(
                    num_serie__iexact=numero_de_serie,
                    etat='actuel'
                ).order_by('-created_at').first()
                
                if not equip:
                    equip = Equipement.objects.filter(
                        num_serie__iexact=numero_de_serie
                    ).order_by('-created_at').first()
                
                if equip:
                    equipement_id = equip.id
            
            data = request.data.copy()
            data['equipement_id'] = equipement_id
            data['incident_type'] = 'hardware'
            
            serializer = HardwareIncidentSerializer(incident, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except HardwareIncident.DoesNotExist:
            try:
                incident = SoftwareIncident.objects.get(pk=pk)
                data = request.data.copy()
                data['incident_type'] = 'software'
                serializer = SoftwareIncidentSerializer(incident, data=data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except SoftwareIncident.DoesNotExist:
                return Response(
                    {'message': 'Incident non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
    
    def update_hardware(self, request, pk=None):
        """Update a hardware incident"""
        try:
            incident = HardwareIncident.objects.get(pk=pk)
        except HardwareIncident.DoesNotExist:
            return Response(
                {'message': 'Incident matériel non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle equipment lookup
        numero_de_serie = request.data.get('numero_de_serie', '').strip() if request.data.get('numero_de_serie') else ''
        equipement_id = None
        
        if numero_de_serie:
            equip = Equipement.objects.filter(
                num_serie__iexact=numero_de_serie,
                etat='actuel'
            ).order_by('-created_at').first()
            
            if not equip:
                equip = Equipement.objects.filter(
                    num_serie__iexact=numero_de_serie
                ).order_by('-created_at').first()
            
            if equip:
                equipement_id = equip.id
        
        data = request.data.copy()
        data['equipement_id'] = equipement_id
        data['incident_type'] = 'hardware'
        
        serializer = HardwareIncidentSerializer(incident, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update_software(self, request, pk=None):
        """Update a software incident"""
        try:
            incident = SoftwareIncident.objects.get(pk=pk)
        except SoftwareIncident.DoesNotExist:
            return Response(
                {'message': 'Incident logiciel non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = request.data.copy()
        data['incident_type'] = 'software'
        serializer = SoftwareIncidentSerializer(incident, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete an incident"""
        # Try hardware first
        try:
            incident = HardwareIncident.objects.get(pk=pk)
            incident.delete()
            return Response({'message': 'Incident matériel supprimé avec succès'})
        except HardwareIncident.DoesNotExist:
            try:
                incident = SoftwareIncident.objects.get(pk=pk)
                # Delete associated report if exists
                Report.objects.filter(software_incident=incident).delete()
                incident.delete()
                return Response({'message': 'Incident logiciel supprimé avec succès'})
            except SoftwareIncident.DoesNotExist:
                return Response(
                    {'message': 'Incident non trouvé'},
                    status=status.HTTP_404_NOT_FOUND
                )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get incident statistics"""
        hardware_count = HardwareIncident.objects.count()
        software_count = SoftwareIncident.objects.count()
        
        # Hardware downtime stats
        hardware_downtime = HardwareIncident.objects.filter(
            duree_arret__isnull=False,
            duree_arret__gt=0
        ).aggregate(
            total=Sum('duree_arret'),
            avg=Avg('duree_arret'),
            count=Count('id')
        )
        
        total_downtime = hardware_downtime['total'] or 0
        avg_downtime = hardware_downtime['avg']
        if avg_downtime:
            avg_downtime = int(round(avg_downtime))
        else:
            avg_downtime = None
        
        downtime_count = hardware_downtime['count'] or 0
        downtime_percentage = int((downtime_count / hardware_count * 100)) if hardware_count > 0 else 0
        
        # Recent incidents (last 7 and 30 days)
        seven_days_ago = timezone.now().date() - timedelta(days=7)
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        
        hardware_last_7 = HardwareIncident.objects.filter(date__gte=seven_days_ago).count()
        hardware_last_30 = HardwareIncident.objects.filter(date__gte=thirty_days_ago).count()
        software_last_7 = SoftwareIncident.objects.filter(date__gte=seven_days_ago).count()
        software_last_30 = SoftwareIncident.objects.filter(date__gte=thirty_days_ago).count()
        
        stats = {
            'total_incidents': hardware_count + software_count,
            'hardware_incidents': hardware_count,
            'software_incidents': software_count,
            'hardware_downtime_minutes': int(total_downtime),
            'hardware_avg_downtime_minutes': avg_downtime,
            'hardware_incidents_with_downtime': downtime_count,
            'hardware_downtime_percentage': downtime_percentage,
            'hardware_last_7_days': hardware_last_7,
            'hardware_last_30_days': hardware_last_30,
            'software_last_7_days': software_last_7,
            'software_last_30_days': software_last_30,
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent incidents"""
        hardware_recent = HardwareIncident.objects.all()[:5]
        software_recent = SoftwareIncident.objects.all()[:5]
        
        hardware_data = HardwareIncidentSerializer(hardware_recent, many=True).data
        software_data = SoftwareIncidentSerializer(software_recent, many=True).data
        
        all_incidents = hardware_data + software_data
        # Sort by created_at descending
        all_incidents.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response(all_incidents[:5])


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for handling reports"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    
    def get_queryset(self):
        queryset = Report.objects.all()
        incident_id = self.request.query_params.get('incident')
        if incident_id:
            queryset = queryset.filter(software_incident_id=incident_id)
        return queryset
    
    def list(self, request):
        """List reports"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data, 'count': len(serializer.data)})
    
    def create(self, request):
        """Create or update a report"""
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save()
            return Response(
                ReportSerializer(report).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for handling equipment"""
    permission_classes = [IsAuthenticated]
    serializer_class = EquipmentSerializer
    
    def get_queryset(self):
        queryset = Equipement.objects.all()
        num_serie = self.request.query_params.get('num_serie')
        search_serie = self.request.query_params.get('search_serie')
        
        if search_serie:
            # Return distinct serial numbers for autocomplete
            serials = Equipement.objects.filter(
                num_serie__icontains=search_serie,
                num_serie__isnull=False
            ).values_list('num_serie', flat=True).distinct()[:10]
            return list(serials)
        
        if num_serie:
            # Get current equipment with this serial number
            trimmed_serial = num_serie.strip()
            queryset = Equipement.objects.filter(
                num_serie__iexact=trimmed_serial,
                etat='actuel'
            ).order_by('-created_at')
            
            if not queryset.exists():
                # Fallback without etat condition
                queryset = Equipement.objects.filter(
                    num_serie__iexact=trimmed_serial
                ).order_by('-created_at')
        
        return queryset
    
    def list(self, request):
        """List equipment"""
        search_serie = request.query_params.get('search_serie')
        num_serie = request.query_params.get('num_serie')
        
        if search_serie:
            # Return serial numbers list
            serials = list(self.get_queryset())
            return Response({'results': serials, 'count': len(serials)})
        
        queryset = self.get_queryset()
        
        if num_serie:
            # Single result
            if queryset.exists():
                serializer = self.get_serializer(queryset.first())
                return Response(serializer.data)
            else:
                return Response(
                    {'message': 'Équipement non trouvé avec ce numéro de série'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Multiple results
            serializer = self.get_serializer(queryset, many=True)
            return Response({'results': serializer.data, 'count': len(serializer.data)})
    
    def create(self, request):
        """Create equipment"""
        serializer = EquipmentSerializer(data=request.data)
        if serializer.is_valid():
            # Validate required fields
            if not serializer.validated_data.get('nom_equipement', '').strip():
                return Response(
                    {'message': 'Le nom de l\'équipement est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not serializer.validated_data.get('partition', '').strip():
                return Response(
                    {'message': 'La partition est requise'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set default etat if not provided
            if 'etat' not in serializer.validated_data or not serializer.validated_data.get('etat'):
                serializer.validated_data['etat'] = 'actuel'
            
            equipment = serializer.save()
            return Response(
                EquipmentSerializer(equipment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update equipment - creates new record with etat='actuel' and marks old one as 'historique'"""
        try:
            existing_equipment = Equipement.objects.get(pk=pk)
        except Equipement.DoesNotExist:
            return Response(
                {'message': 'Équipement non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = EquipmentSerializer(data=request.data)
        if serializer.is_valid():
            # Validate required fields
            if not serializer.validated_data.get('nom_equipement', '').strip():
                return Response(
                    {'message': 'Le nom de l\'équipement est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not serializer.validated_data.get('partition', '').strip():
                return Response(
                    {'message': 'La partition est requise'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            num_serie = serializer.validated_data.get('num_serie') or existing_equipment.num_serie
            
            # Find latest equipment with same serial and etat='actuel'
            latest_equip = Equipement.objects.filter(
                num_serie=num_serie,
                etat='actuel'
            ).order_by('-created_at').first()
            
            if latest_equip:
                # Mark as historique
                latest_equip.etat = 'historique'
                latest_equip.save()
            
            # Create new equipment with updated data
            new_equipment = Equipement.objects.create(
                num_serie=num_serie,
                nom_equipement=serializer.validated_data['nom_equipement'],
                partition=serializer.validated_data['partition'],
                etat='actuel'
            )
            
            return Response(EquipmentSerializer(new_equipment).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get all incidents related to a specific equipment"""
        try:
            equipment = Equipement.objects.get(pk=pk)
        except Equipement.DoesNotExist:
            return Response(
                {'message': 'Équipement non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all hardware incidents for this equipment (by equipement_id or serial number)
        hardware_incidents = HardwareIncident.objects.filter(
            Q(equipement_id=equipment.id) | 
            Q(numero_de_serie__iexact=equipment.num_serie)
        ).order_by('-date', '-time')
        
        hardware_data = HardwareIncidentSerializer(hardware_incidents, many=True).data
        
        # Get equipment info
        equipment_data = EquipmentSerializer(equipment).data
        
        return Response({
            'equipment': equipment_data,
            'incidents': hardware_data,
            'count': len(hardware_data)
        })

