from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthAPITestCase(APITestCase):
    def test_register_returns_tokens_and_creates_user(self):
        response = self.client.post(
            reverse('auth_register'),
            {
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'StrongPass123!',
                'password_confirm': 'StrongPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_register_rejects_mismatched_passwords(self):
        response = self.client.post(
            reverse('auth_register'),
            {
                'username': 'anotheruser',
                'email': 'another@example.com',
                'password': 'StrongPass123!',
                'password_confirm': 'DifferentPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens(self):
        User.objects.create_user(
            username='loginuser',
            email='login@example.com',
            password='StrongPass123!',
        )

        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'loginuser', 'password': 'StrongPass123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], 'loginuser')

    def test_login_rejects_invalid_credentials(self):
        User.objects.create_user(
            username='badlogin',
            email='badlogin@example.com',
            password='StrongPass123!',
        )

        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'badlogin', 'password': 'WrongPassword123!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse('current_user'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
