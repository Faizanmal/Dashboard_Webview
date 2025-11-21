import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import MetricSnapshot, Alert


class DashboardConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time dashboard updates
    """
    
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('dashboard_id', 'global')
        self.room_group_name = f'dashboard_{self.room_name}'
        
        # Authenticate user from token
        self.user = await self.get_user_from_token()
        
        if self.user is None or isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial connection message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to dashboard {self.room_name}'
        }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_metrics':
                # Subscribe to specific metrics
                metric_names = data.get('metrics', [])
                await self.subscribe_to_metrics(metric_names)
            
            elif message_type == 'ping':
                # Respond to ping
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def metric_update(self, event):
        """
        Send metric update to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'metric_update',
            'metric': event['metric'],
            'value': event['value'],
            'timestamp': event['timestamp']
        }))
    
    async def alert_triggered(self, event):
        """
        Send alert notification to WebSocket
        """
        await self.send(text_data=json.dumps({
            'type': 'alert_triggered',
            'alert': event['alert'],
            'message': event['message']
        }))
    
    async def dashboard_update(self, event):
        """
        Send dashboard update notification
        """
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'action': event['action'],
            'data': event['data']
        }))
    
    @database_sync_to_async
    def get_user_from_token(self):
        """
        Authenticate user from JWT token in query string
        """
        from django.contrib.auth.models import User
        
        # Get token from query string
        query_string = self.scope.get('query_string', b'').decode()
        params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = params.get('token')
        
        if not token:
            return None
        
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, User.DoesNotExist):
            return None
    
    async def subscribe_to_metrics(self, metric_names):
        """
        Subscribe to specific metric updates
        """
        # Store subscribed metrics in the consumer
        self.subscribed_metrics = metric_names
        
        # Send confirmation
        await self.send(text_data=json.dumps({
            'type': 'subscription_confirmed',
            'metrics': metric_names
        }))


class MetricsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time metric streaming
    """
    
    async def connect(self):
        self.room_group_name = 'metrics_stream'
        
        # Authenticate user
        self.user = await self.get_user_from_token()
        
        if self.user is None or isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Join metrics stream group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial message
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': 'Connected to metrics stream'
        }))
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'request_metrics':
                # Request current metrics
                metrics = await self.get_latest_metrics()
                await self.send(text_data=json.dumps({
                    'type': 'metrics_snapshot',
                    'metrics': metrics
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))
    
    async def metric_broadcast(self, event):
        """
        Broadcast metric update to all connected clients
        """
        await self.send(text_data=json.dumps({
            'type': 'metric_update',
            'metric_name': event['metric_name'],
            'value': event['value'],
            'timestamp': event['timestamp']
        }))
    
    @database_sync_to_async
    def get_user_from_token(self):
        """Authenticate user from JWT token"""
        from django.contrib.auth.models import User
        
        query_string = self.scope.get('query_string', b'').decode()
        params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = params.get('token')
        
        if not token:
            return None
        
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, User.DoesNotExist):
            return None
    
    @database_sync_to_async
    def get_latest_metrics(self):
        """Get latest metric values"""
        from django.db.models import Max
        from datetime import timedelta
        from django.utils import timezone
        
        # Get metrics from last 5 minutes
        time_threshold = timezone.now() - timedelta(minutes=5)
        metrics = MetricSnapshot.objects.filter(
            timestamp__gte=time_threshold
        ).values('metric_name').annotate(
            latest_value=Max('value')
        )
        
        return list(metrics)
