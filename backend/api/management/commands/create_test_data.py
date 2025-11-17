from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from api.models import Equipement, HardwareIncident, SoftwareIncident, Report
import random


class Command(BaseCommand):
    help = 'Create test data for equipment, hardware incidents, and software incidents'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing test data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing test data...')
            HardwareIncident.objects.all().delete()
            SoftwareIncident.objects.all().delete()
            Report.objects.all().delete()
            Equipement.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Cleared existing data'))

        self.stdout.write('Creating test data...')

        # Create equipment
        equipment_data = [
            {'num_serie': 'EQ-001', 'nom_equipement': 'Radar Principal', 'partition': 'Secteur A'},
            {'num_serie': 'EQ-002', 'nom_equipement': 'Radar Secondaire', 'partition': 'Secteur B'},
            {'num_serie': 'EQ-003', 'nom_equipement': 'Système de Communication', 'partition': 'Secteur A'},
            {'num_serie': 'EQ-004', 'nom_equipement': 'Station de Contrôle', 'partition': 'Secteur C'},
            {'num_serie': 'EQ-005', 'nom_equipement': 'Antenne Réseau', 'partition': 'Secteur B'},
        ]

        equipment_objects = []
        for eq_data in equipment_data:
            equip, created = Equipement.objects.get_or_create(
                num_serie=eq_data['num_serie'],
                defaults={
                    'nom_equipement': eq_data['nom_equipement'],
                    'partition': eq_data['partition'],
                    'etat': 'actuel'
                }
            )
            equipment_objects.append(equip)
            if created:
                self.stdout.write(f'  ✅ Created equipment: {eq_data["num_serie"]}')

        # Create hardware incidents
        hardware_descriptions = [
            'Panne du système de refroidissement',
            'Défaillance du module de transmission',
            'Problème de connectivité réseau',
            'Dégradation du signal radar',
            'Erreur de calibration du système',
            'Surveillance du système de sécurité',
            'Maintenance préventive effectuée',
            'Remplacement de composant défectueux',
        ]

        hardware_anomalies = [
            'Surchauffe du processeur',
            'Perte de signal intermittente',
            'Erreur de communication',
            'Signal faible détecté',
            'Dérive de calibration',
            'Alerte système',
            'Vérification de routine',
            'Composant usé',
        ]

        hardware_actions = [
            'Nettoyage et remplacement du ventilateur',
            'Remplacement du module de transmission',
            'Reconfiguration du réseau',
            'Ajustement de l\'antenne',
            'Recalibration complète',
            'Vérification des systèmes',
            'Inspection et maintenance',
            'Remplacement du composant',
        ]

        for i in range(15):
            days_ago = random.randint(0, 60)
            incident_date = date.today() - timedelta(days=days_ago)
            incident_time = time(random.randint(8, 18), random.randint(0, 59))
            
            equip = random.choice(equipment_objects)
            desc = random.choice(hardware_descriptions)
            anomalie = random.choice(hardware_anomalies)
            action = random.choice(hardware_actions)
            
            incident = HardwareIncident.objects.create(
                date=incident_date,
                time=incident_time,
                nom_de_equipement=equip.nom_equipement,
                partition=equip.partition,
                numero_de_serie=equip.num_serie,
                equipement_id=equip.id,
                description=desc,
                anomalie_observee=anomalie,
                action_realisee=action,
                piece_de_rechange_utilisee=f'Pièce {random.randint(100, 999)}' if random.random() > 0.3 else '',
                etat_de_equipement_apres_intervention='Fonctionnel' if random.random() > 0.2 else 'En observation',
                recommendation='Surveillance continue recommandée' if random.random() > 0.5 else '',
                duree_arret=random.randint(30, 480) if random.random() > 0.4 else None,
            )
            self.stdout.write(f'  ✅ Created hardware incident #{incident.id}')

        # Create software incidents
        software_descriptions = [
            'Erreur de traitement des données radar',
            'Problème de synchronisation entre systèmes',
            'Défaillance du logiciel de contrôle',
            'Erreur dans le calcul de trajectoire',
            'Problème d\'affichage sur l\'interface',
            'Perte de connexion avec le serveur',
            'Erreur de validation des données',
            'Problème de performance du système',
        ]

        software_sujets = [
            'Erreur système',
            'Problème de synchronisation',
            'Défaillance logicielle',
            'Erreur de calcul',
            'Problème d\'interface',
            'Connexion perdue',
            'Validation échouée',
            'Performance dégradée',
        ]

        for i in range(12):
            days_ago = random.randint(0, 45)
            incident_date = date.today() - timedelta(days=days_ago)
            incident_time = time(random.randint(0, 23), random.randint(0, 59))
            
            incident = SoftwareIncident.objects.create(
                date=incident_date,
                time=incident_time,
                simulateur=random.random() > 0.6,
                salle_operationnelle=random.random() > 0.4,
                server=f'SERVER-{random.randint(1, 5)}' if random.random() > 0.3 else '',
                game=f'GAME-{random.randint(1, 3)}' if random.random() > 0.5 else '',
                partition=random.choice(['Secteur A', 'Secteur B', 'Secteur C', '']),
                group=random.choice(['Groupe 1', 'Groupe 2', '']),
                exercice=random.choice(['Exercice Alpha', 'Exercice Beta', '']),
                secteur=random.choice(['Secteur A', 'Secteur B', 'Secteur C', '']),
                position_STA=f'STA-{random.randint(1, 10)}' if random.random() > 0.4 else '',
                position_logique=f'LOG-{random.randint(1, 20)}' if random.random() > 0.5 else '',
                type_d_anomalie=random.choice(['Erreur système', 'Problème réseau', 'Erreur logique', '']),
                indicatif=random.choice(['IND-001', 'IND-002', 'IND-003', '']),
                mode_radar=random.choice(['Mode 1', 'Mode 2', 'Mode 3', '']),
                FL=f'FL{random.randint(100, 400)}' if random.random() > 0.5 else '',
                longitude=f'{random.uniform(-180, 180):.6f}' if random.random() > 0.6 else '',
                latitude=f'{random.uniform(-90, 90):.6f}' if random.random() > 0.6 else '',
                code_SSR=random.choice(['SSR-001', 'SSR-002', '']),
                sujet=random.choice(software_sujets),
                description=random.choice(software_descriptions),
                commentaires='Résolu après redémarrage' if random.random() > 0.5 else '',
            )
            self.stdout.write(f'  ✅ Created software incident #{incident.id}')

        # Create some reports for software incidents
        software_incidents = SoftwareIncident.objects.all()[:5]
        for incident in software_incidents:
            report, created = Report.objects.get_or_create(
                software_incident=incident,
                defaults={
                    'date': incident.date,
                    'time': incident.time,
                    'anomaly': incident.description,
                    'analysis': f'Analyse approfondie de l\'incident #{incident.id}. Le problème a été identifié et résolu.',
                    'conclusion': 'Incident résolu avec succès. Aucun impact sur les opérations.',
                }
            )
            if created:
                self.stdout.write(f'  ✅ Created report for software incident #{incident.id}')

        self.stdout.write(self.style.SUCCESS('\n✅ Test data created successfully!'))
        self.stdout.write(f'  - Equipment: {Equipement.objects.count()}')
        self.stdout.write(f'  - Hardware incidents: {HardwareIncident.objects.count()}')
        self.stdout.write(f'  - Software incidents: {SoftwareIncident.objects.count()}')
        self.stdout.write(f'  - Reports: {Report.objects.count()}')

