from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from analytics.models import UserRole, Dashboard, Widget


class Command(BaseCommand):
    help = 'Setup initial data for the dashboard application'

    def handle(self, *args, **options):
        self.stdout.write('Setting up initial data...')
        
        # Create default admin user if not exists
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created admin user: admin / admin123'))
        else:
            admin_user = User.objects.get(username='admin')
            self.stdout.write('✓ Admin user already exists')
        
        # Create default test users
        test_users = [
            {'username': 'editor', 'role': 'editor', 'password': 'editor123'},
            {'username': 'viewer', 'role': 'viewer', 'password': 'viewer123'},
        ]
        
        for user_data in test_users:
            if not User.objects.filter(username=user_data['username']).exists():
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=f"{user_data['username']}@example.com",
                    password=user_data['password'],
                    first_name=user_data['username'].capitalize(),
                    last_name='User'
                )
                UserRole.objects.create(
                    user=user,
                    role=user_data['role']
                )
                self.stdout.write(self.style.SUCCESS(
                    f"✓ Created {user_data['role']} user: {user_data['username']} / {user_data['password']}"
                ))
            else:
                self.stdout.write(f"✓ User {user_data['username']} already exists")
        
        # Create admin role
        if not UserRole.objects.filter(user=admin_user).exists():
            UserRole.objects.create(
                user=admin_user,
                role='admin',
                permissions={
                    'can_export': True,
                    'can_import': True,
                    'can_manage_users': True,
                    'can_manage_dashboards': True,
                }
            )
            self.stdout.write(self.style.SUCCESS('✓ Created admin role'))
        
        # Create default dashboard for admin
        if not Dashboard.objects.filter(owner=admin_user, name='Default Dashboard').exists():
            dashboard = Dashboard.objects.create(
                name='Default Dashboard',
                description='Default analytics dashboard with sample widgets',
                owner=admin_user,
                is_default=True,
                layout_config={
                    'grid': {'cols': 12, 'rows': 'auto'},
                    'breakpoints': {'lg': 1200, 'md': 996, 'sm': 768}
                }
            )
            
            # Create sample widgets
            widgets = [
                {
                    'title': 'Total Revenue',
                    'widget_type': 'metric',
                    'data_source': '/api/v1/analytics/metrics/',
                    'position_x': 0,
                    'position_y': 0,
                    'width': 3,
                    'height': 2,
                    'config': {'metric_key': 'totalRevenue'}
                },
                {
                    'title': 'Total Users',
                    'widget_type': 'metric',
                    'data_source': '/api/v1/analytics/metrics/',
                    'position_x': 3,
                    'position_y': 0,
                    'width': 3,
                    'height': 2,
                    'config': {'metric_key': 'totalUsers'}
                },
                {
                    'title': 'Revenue Trend',
                    'widget_type': 'chart',
                    'data_source': '/api/v1/analytics/revenue/',
                    'position_x': 0,
                    'position_y': 2,
                    'width': 6,
                    'height': 4,
                    'config': {'chart_type': 'line', 'color': '#8884d8'}
                },
                {
                    'title': 'Channel Performance',
                    'widget_type': 'chart',
                    'data_source': '/api/v1/analytics/channels/',
                    'position_x': 6,
                    'position_y': 2,
                    'width': 6,
                    'height': 4,
                    'config': {'chart_type': 'bar', 'color': '#82ca9d'}
                },
            ]
            
            for widget_data in widgets:
                Widget.objects.create(dashboard=dashboard, **widget_data)
            
            self.stdout.write(self.style.SUCCESS(
                f'✓ Created default dashboard with {len(widgets)} widgets'
            ))
        
        self.stdout.write(self.style.SUCCESS('\n✓ Initial setup complete!'))
        self.stdout.write('\nYou can now:')
        self.stdout.write('  1. Run migrations: python manage.py migrate')
        self.stdout.write('  2. Start the server: python manage.py runserver')
        self.stdout.write('  3. Login with: admin / admin123')
