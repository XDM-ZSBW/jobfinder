"""
System Health Monitoring with SMS Alerts
Monitors critical subsystems and sends SMS alerts when they go offline.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import aiohttp
from twilio.rest import Client

from backend.config import settings

logger = logging.getLogger(__name__)


@dataclass
class SubsystemStatus:
    """Status of a monitored subsystem."""
    name: str
    is_healthy: bool
    last_check: datetime
    error_message: Optional[str] = None
    consecutive_failures: int = 0


class SystemMonitor:
    """Monitors critical subsystems and sends SMS alerts."""
    
    # Alert configuration
    ALERT_PHONE = "+12132484250"  # Your phone number
    TWILIO_FROM = None  # Will be loaded from settings
    
    # Monitoring intervals
    CHECK_INTERVAL = 60  # Check every 60 seconds
    ALERT_COOLDOWN = 300  # 5 minutes between duplicate alerts
    
    # Failure thresholds
    FAILURE_THRESHOLD = 3  # Alert after 3 consecutive failures
    
    def __init__(self):
        """Initialize the system monitor."""
        self.subsystems: Dict[str, SubsystemStatus] = {}
        self.last_alerts: Dict[str, datetime] = {}
        
        # Initialize Twilio client
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.twilio_client = Client(
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN
            )
            self.TWILIO_FROM = settings.TWILIO_PHONE_NUMBER
            logger.info("✅ Twilio SMS alerting enabled")
        else:
            self.twilio_client = None
            logger.warning("⚠️  Twilio not configured - alerts will be logged only")
    
    async def check_linear_mcp(self) -> SubsystemStatus:
        """Check Linear MCP API availability."""
        try:
            async with aiohttp.ClientSession() as session:
                # Check Linear GraphQL API
                async with session.post(
                    'https://api.linear.app/graphql',
                    json={'query': '{ viewer { id } }'},
                    headers={'Authorization': 'Bearer YOUR_LINEAR_TOKEN'},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        return SubsystemStatus(
                            name="Linear MCP",
                            is_healthy=True,
                            last_check=datetime.now()
                        )
                    else:
                        return SubsystemStatus(
                            name="Linear MCP",
                            is_healthy=False,
                            last_check=datetime.now(),
                            error_message=f"HTTP {response.status}"
                        )
        except Exception as e:
            return SubsystemStatus(
                name="Linear MCP",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def check_database(self) -> SubsystemStatus:
        """Check PostgreSQL database availability."""
        try:
            # Import here to avoid circular dependency
            from sqlalchemy import create_engine, text
            
            engine = create_engine(settings.DATABASE_URL)
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                if result:
                    return SubsystemStatus(
                        name="PostgreSQL Database",
                        is_healthy=True,
                        last_check=datetime.now()
                    )
        except Exception as e:
            return SubsystemStatus(
                name="PostgreSQL Database",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def check_redis(self) -> SubsystemStatus:
        """Check Redis cache availability."""
        try:
            import redis.asyncio as redis
            
            client = redis.from_url(settings.REDIS_URL)
            await client.ping()
            await client.close()
            
            return SubsystemStatus(
                name="Redis Cache",
                is_healthy=True,
                last_check=datetime.now()
            )
        except Exception as e:
            return SubsystemStatus(
                name="Redis Cache",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def check_elasticsearch(self) -> SubsystemStatus:
        """Check Elasticsearch availability."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{settings.ELASTICSEARCH_URL}/_cluster/health",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        return SubsystemStatus(
                            name="Elasticsearch",
                            is_healthy=True,
                            last_check=datetime.now()
                        )
                    else:
                        return SubsystemStatus(
                            name="Elasticsearch",
                            is_healthy=False,
                            last_check=datetime.now(),
                            error_message=f"HTTP {response.status}"
                        )
        except Exception as e:
            return SubsystemStatus(
                name="Elasticsearch",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def check_ollama(self) -> SubsystemStatus:
        """Check Ollama LLM service availability."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{settings.OLLAMA_BASE_URL}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        return SubsystemStatus(
                            name="Ollama LLM",
                            is_healthy=True,
                            last_check=datetime.now()
                        )
                    else:
                        return SubsystemStatus(
                            name="Ollama LLM",
                            is_healthy=False,
                            last_check=datetime.now(),
                            error_message=f"HTTP {response.status}"
                        )
        except Exception as e:
            return SubsystemStatus(
                name="Ollama LLM",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def check_frontend(self) -> SubsystemStatus:
        """Check frontend Next.js application."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://jobmatch.zip",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status == 200:
                        return SubsystemStatus(
                            name="Frontend (jobmatch.zip)",
                            is_healthy=True,
                            last_check=datetime.now()
                        )
                    else:
                        return SubsystemStatus(
                            name="Frontend (jobmatch.zip)",
                            is_healthy=False,
                            last_check=datetime.now(),
                            error_message=f"HTTP {response.status}"
                        )
        except Exception as e:
            return SubsystemStatus(
                name="Frontend (jobmatch.zip)",
                is_healthy=False,
                last_check=datetime.now(),
                error_message=str(e)
            )
    
    async def send_sms_alert(self, message: str) -> bool:
        """Send SMS alert via Twilio."""
        if not self.twilio_client:
            logger.warning(f"📱 ALERT (Twilio disabled): {message}")
            return False
        
        try:
            sms = self.twilio_client.messages.create(
                body=message,
                from_=self.TWILIO_FROM,
                to=self.ALERT_PHONE
            )
            logger.info(f"✅ SMS alert sent: {sms.sid}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send SMS alert: {e}")
            return False
    
    def should_send_alert(self, subsystem_name: str) -> bool:
        """Check if enough time has passed since last alert."""
        if subsystem_name not in self.last_alerts:
            return True
        
        time_since_last = datetime.now() - self.last_alerts[subsystem_name]
        return time_since_last.total_seconds() >= self.ALERT_COOLDOWN
    
    async def handle_failure(self, status: SubsystemStatus):
        """Handle subsystem failure and send alert if needed."""
        # Get or initialize subsystem tracking
        if status.name in self.subsystems:
            previous = self.subsystems[status.name]
            status.consecutive_failures = previous.consecutive_failures + 1
        else:
            status.consecutive_failures = 1
        
        self.subsystems[status.name] = status
        
        # Check if we should alert
        if (status.consecutive_failures >= self.FAILURE_THRESHOLD and 
            self.should_send_alert(status.name)):
            
            alert_message = (
                f"🚨 JOBMATCH ALERT 🚨\n\n"
                f"System: {status.name}\n"
                f"Status: OFFLINE\n"
                f"Failures: {status.consecutive_failures}\n"
                f"Error: {status.error_message or 'Unknown'}\n"
                f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            )
            
            await self.send_sms_alert(alert_message)
            self.last_alerts[status.name] = datetime.now()
            
            logger.error(f"🚨 {status.name} is DOWN: {status.error_message}")
    
    async def handle_recovery(self, status: SubsystemStatus):
        """Handle subsystem recovery and send recovery notification."""
        if status.name in self.subsystems:
            previous = self.subsystems[status.name]
            if not previous.is_healthy and previous.consecutive_failures >= self.FAILURE_THRESHOLD:
                # System recovered after being down
                recovery_message = (
                    f"✅ JOBMATCH RECOVERY ✅\n\n"
                    f"System: {status.name}\n"
                    f"Status: BACK ONLINE\n"
                    f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                )
                await self.send_sms_alert(recovery_message)
                logger.info(f"✅ {status.name} is BACK ONLINE")
        
        # Reset consecutive failures
        status.consecutive_failures = 0
        self.subsystems[status.name] = status
    
    async def check_all_subsystems(self):
        """Check all critical subsystems."""
        checks = [
            self.check_linear_mcp(),
            self.check_database(),
            self.check_redis(),
            self.check_elasticsearch(),
            self.check_ollama(),
            self.check_frontend(),
        ]
        
        results = await asyncio.gather(*checks, return_exceptions=True)
        
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Check failed with exception: {result}")
                continue
            
            if result.is_healthy:
                await self.handle_recovery(result)
            else:
                await self.handle_failure(result)
    
    async def run_monitoring_loop(self):
        """Main monitoring loop."""
        logger.info("🔍 System monitoring started")
        logger.info(f"📱 Alerts will be sent to: {self.ALERT_PHONE}")
        logger.info(f"⏱️  Check interval: {self.CHECK_INTERVAL}s")
        
        while True:
            try:
                await self.check_all_subsystems()
                await asyncio.sleep(self.CHECK_INTERVAL)
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                await asyncio.sleep(self.CHECK_INTERVAL)
    
    def get_status_report(self) -> Dict[str, Any]:
        """Get current status of all monitored subsystems."""
        return {
            subsystem_name: {
                "healthy": status.is_healthy,
                "last_check": status.last_check.isoformat(),
                "consecutive_failures": status.consecutive_failures,
                "error": status.error_message
            }
            for subsystem_name, status in self.subsystems.items()
        }


# Global monitor instance
monitor = SystemMonitor()


async def start_monitoring():
    """Start the system monitoring service."""
    await monitor.run_monitoring_loop()


def get_monitor_status() -> Dict[str, Any]:
    """Get current monitoring status."""
    return monitor.get_status_report()
