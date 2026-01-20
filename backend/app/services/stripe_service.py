import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY # Cargado desde el archivo .env

class StripeService:
    @staticmethod
    def create_checkout_session(customer_email: str, success_url: str, cancel_url: str, amount: float = 19.99):
        try:
            unit_amount = int(amount * 100) # De dólares a centavos
            checkout_session = stripe.checkout.Session.create(
                customer_email=customer_email,
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': 'NexoBot Premium Subscription',
                                'description': 'Full access to all NexoBot business features (7 Days Free Trial)',
                            },
                            'unit_amount': unit_amount,
                        },
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                subscription_data={
                    'trial_period_days': 7,
                },
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return checkout_session.url
        except Exception as e:
            print(f"Error Stripe: {e}")
            return None

    @staticmethod
    def create_customer_portal_session(customer_id: str, return_url: str):
        """
        Crea una sesión para el Portal de Clientes de Stripe.
        Permite cancelar suscripciones, cambiar tarjetas y ver facturas.
        """
        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return portal_session.url
        except Exception as e:
            print(f"Error Portal Stripe: {e}")
            return None
