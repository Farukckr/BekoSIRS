# products/management/commands/train_recommender.py
from django.core.management.base import BaseCommand
from products.ml_recommender import HybridRecommender


class Command(BaseCommand):
    help = 'Train the ML recommendation model with current data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting ML recommender training...'))
        
        try:
            recommender = HybridRecommender()
            
            # Display model info
            self.stdout.write(self.style.SUCCESS(f'✓ Model trained successfully'))
            
            if recommender.products_df is not None:
                self.stdout.write(f'  - Total products: {len(recommender.products_df)}')
            
            if recommender.similarity_matrix is not None:
                self.stdout.write(f'  - Content-based similarity matrix: ✓')
            else:
                self.stdout.write(self.style.WARNING(f'  - Content-based similarity matrix: ✗'))
            
            if recommender.svd_model is not None:
                self.stdout.write(f'  - Collaborative filtering model: ✓')
            else:
                self.stdout.write(self.style.WARNING(f'  - Collaborative filtering model: ✗ (insufficient data)'))
            
            self.stdout.write(self.style.SUCCESS('\nTraining completed!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Training failed: {str(e)}'))
            raise
