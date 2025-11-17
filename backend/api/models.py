from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Custom user model with role field"""
    ROLE_CHOICES = [
        ('technicien', 'Technicien'),
        ('ingenieur', 'Ingénieur'),
        ('chefdep', 'Chef de Département'),
        ('superuser', 'Super Utilisateur'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='technicien')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'users'


class Equipement(models.Model):
    """Equipment model"""
    num_serie = models.CharField(max_length=255, null=True, blank=True)
    nom_equipement = models.CharField(max_length=255)
    partition = models.CharField(max_length=255)
    etat = models.CharField(max_length=50, default='actuel')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equipement'
        ordering = ['-created_at']


class HardwareIncident(models.Model):
    """Hardware incident model"""
    date = models.DateField()
    time = models.TimeField()
    nom_de_equipement = models.CharField(max_length=255)
    partition = models.CharField(max_length=255, null=True, blank=True)
    numero_de_serie = models.CharField(max_length=255, null=True, blank=True)
    equipement_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    anomalie_observee = models.TextField(null=True, blank=True)
    action_realisee = models.TextField(null=True, blank=True)
    piece_de_rechange_utilisee = models.TextField(null=True, blank=True)
    etat_de_equipement_apres_intervention = models.TextField(null=True, blank=True)
    recommendation = models.TextField(null=True, blank=True)
    duree_arret = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hardware_incidents'
        ordering = ['-created_at']


class SoftwareIncident(models.Model):
    """Software incident model"""
    date = models.DateField()
    time = models.TimeField()
    simulateur = models.BooleanField(default=False)
    salle_operationnelle = models.BooleanField(default=False)
    server = models.CharField(max_length=255, null=True, blank=True)
    game = models.CharField(max_length=255, null=True, blank=True)
    partition = models.CharField(max_length=255, null=True, blank=True)
    group = models.CharField(max_length=255, null=True, blank=True)
    exercice = models.CharField(max_length=255, null=True, blank=True)
    secteur = models.CharField(max_length=255, null=True, blank=True)
    position_STA = models.CharField(max_length=255, null=True, blank=True)
    position_logique = models.CharField(max_length=255, null=True, blank=True)
    type_d_anomalie = models.CharField(max_length=255, null=True, blank=True)
    indicatif = models.CharField(max_length=255, null=True, blank=True)
    mode_radar = models.CharField(max_length=255, null=True, blank=True)
    FL = models.CharField(max_length=255, null=True, blank=True)
    longitude = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.CharField(max_length=255, null=True, blank=True)
    code_SSR = models.CharField(max_length=255, null=True, blank=True)
    sujet = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField()
    commentaires = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'software_incidents'
        ordering = ['-created_at']


class Report(models.Model):
    """Report model - one per software incident"""
    software_incident = models.OneToOneField(
        SoftwareIncident,
        on_delete=models.CASCADE,
        related_name='report'
    )
    date = models.DateField()
    time = models.TimeField()
    anomaly = models.TextField()
    analysis = models.TextField()
    conclusion = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

