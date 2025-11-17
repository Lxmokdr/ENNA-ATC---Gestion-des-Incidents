from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, HardwareIncident, SoftwareIncident, Report, Equipement


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'role', 'created_at']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role',)}),
    )


@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ['nom_equipement', 'num_serie', 'partition', 'etat', 'created_at']
    list_filter = ['etat', 'created_at']
    search_fields = ['nom_equipement', 'num_serie', 'partition']


@admin.register(HardwareIncident)
class HardwareIncidentAdmin(admin.ModelAdmin):
    list_display = ['id', 'nom_de_equipement', 'date', 'time', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['nom_de_equipement', 'description', 'numero_de_serie']


@admin.register(SoftwareIncident)
class SoftwareIncidentAdmin(admin.ModelAdmin):
    list_display = ['id', 'sujet', 'date', 'time', 'created_at']
    list_filter = ['date', 'created_at', 'simulateur', 'salle_operationnelle']
    search_fields = ['sujet', 'description', 'commentaires']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'software_incident', 'date', 'time', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['anomaly', 'analysis', 'conclusion']

