"""
Run this to verify your Gmail SMTP credentials work:
    python backend/test_email.py your-gmail@gmail.com

It sends a test email to the address you specify.
"""
import os
import sys
import django

# Bootstrap Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Change to backend directory so Django can find the module
import pathlib
backend_dir = pathlib.Path(__file__).parent
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

django.setup()

from django.conf import settings
from django.core.mail import send_mail

recipient = sys.argv[1] if len(sys.argv) > 1 else settings.EMAIL_HOST_USER

print("=" * 60)
print("DietPlanner — Gmail SMTP Test")
print("=" * 60)
print(f"EMAIL_BACKEND     : {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST        : {settings.EMAIL_HOST}")
print(f"EMAIL_PORT        : {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS     : {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER   : {settings.EMAIL_HOST_USER or '❌ NOT SET'}")
print(f"EMAIL_HOST_PASSWORD: {'✅ SET' if settings.EMAIL_HOST_PASSWORD else '❌ NOT SET'}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print(f"Sending test email to: {recipient}")
print("=" * 60)

if not settings.EMAIL_HOST_USER:
    print("\n❌  EMAIL_HOST_USER is empty in backend/.env")
    print("   Fill in your Gmail address and 16-char App Password first.")
    sys.exit(1)

if not settings.EMAIL_HOST_PASSWORD:
    print("\n❌  EMAIL_HOST_PASSWORD is empty in backend/.env")
    print("   Generate an App Password at: https://myaccount.google.com/apppasswords")
    sys.exit(1)

try:
    send_mail(
        subject="✅ DietPlanner — SMTP Test",
        message="If you received this, Gmail SMTP is working correctly for DietPlanner!",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=False,
    )
    print(f"\n✅  Email sent successfully to {recipient}")
    print("   Check your Gmail inbox (and Spam folder).")
except Exception as e:
    print(f"\n❌  SMTP Error: {e}")
    print("\n  Common fixes:")
    print("  1. Make sure 2-Step Verification is enabled on your Google Account")
    print("  2. Use an App Password (NOT your real Gmail password)")
    print("     → https://myaccount.google.com/apppasswords")
    print("  3. Make sure EMAIL_HOST_USER and EMAIL_HOST_PASSWORD are filled in .env")
    sys.exit(1)
