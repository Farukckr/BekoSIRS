# -*- coding: utf-8 -*-
"""
Management command to seed KKTC location data (Districts and Areas).
Idempotent - can be run multiple times without creating duplicates.

Usage:
    python manage.py seed_kktc_locations
"""
from django.core.management.base import BaseCommand
from products.models import District, Area


class Command(BaseCommand):
    help = 'Seed KKTC Districts and Areas (Idempotent)'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('KKTC Location Data Seeding'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')

        # KKTC Districts with center coords and their Areas
        locations_data = {
            'Güzelyurt': {
                'center_lat': 35.2042,
                'center_lng': 33.0144,
                'areas': ['Kalkanlı', 'Gaziveren', 'Akdeniz', 'Yedidalga', 'Bostancı', 'Yayla']
            },
            'Lefkoşa': {
                'center_lat': 35.1856,
                'center_lng': 33.3823,
                'areas': ['Gönyeli', 'Hamitköy', 'Ortaköy', 'Değirmenlik', 'Haspolat', 'Geçitkale']
            },
            'Girne': {
                'center_lat': 35.3387,
                'center_lng': 33.3176,
                'areas': ['Alsancak', 'Lapta', 'Karaoğlanoğlu', 'Esentepe', 'Çatalköy', 'Bellapais']
            },
            'Gazimağusa': {
                'center_lat': 35.1264,
                'center_lng': 33.9384,
                'areas': ['Tuzla', 'Salamis', 'Yeni Boğaziçi', 'Boğaz', 'Kumyalı']
            },
            'İskele': {
                'center_lat': 35.2886,
                'center_lng': 33.9082,
                'areas': ['Long Beach', 'Bafra', 'Mehmetçik', 'Yeniceköy', 'Büyükkonuk']
            },
            'Lefke': {
                'center_lat': 35.1085,
                'center_lng': 32.8516,
                'areas': ['Gemikonağı', 'Yeşilyurt', 'Aplıç', 'Dörtyol']
            },
        }

        districts_created = 0
        districts_exists = 0
        areas_created = 0
        areas_exists = 0

        for district_name, district_data in locations_data.items():
            # Get or create district with center coordinates
            district, created = District.objects.get_or_create(
                name=district_name,
                defaults={
                    'center_lat': district_data['center_lat'],
                    'center_lng': district_data['center_lng']
                }
            )
            
            # Update coords if district exists but coords are missing
            if not created and (not district.center_lat or not district.center_lng):
                district.center_lat = district_data['center_lat']
                district.center_lng = district_data['center_lng']
                district.save()
            
            if created:
                districts_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Created district: {district_name}')
                )
            else:
                districts_exists += 1
                self.stdout.write(
                    self.style.WARNING(f'  - District already exists: {district_name}')
                )

            # Create areas for this district
            area_names = district_data['areas']
            for area_name in area_names:
                area, created = Area.objects.get_or_create(
                    district=district,
                    name=area_name
                )
                
                if created:
                    areas_created += 1
                    self.stdout.write(f'      → Created area: {area_name}')
                else:
                    areas_exists += 1

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('Seeding Summary'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'  Districts Created: {districts_created}')
        self.stdout.write(f'  Districts Existing: {districts_exists}')
        self.stdout.write(f'  Areas Created: {areas_created}')
        self.stdout.write(f'  Areas Existing: {areas_exists}')
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS('✓ KKTC location data seeding completed!')
        )
