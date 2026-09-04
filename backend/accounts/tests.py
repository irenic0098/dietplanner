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

    def test_password_reset_request_success(self):
        User.objects.create_user(
            username='resetuser',
            email='reset@example.com',
            password='OldPassword123!',
        )

        response = self.client.post(
            reverse('password_reset_request'),
            {'email': 'reset@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('reset_url', response.data)

    def test_password_reset_request_rejects_unknown_email(self):
        response = self.client.post(
            reverse('password_reset_request'),
            {'email': 'unknown@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_confirm_success(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        from django.contrib.auth.tokens import default_token_generator

        user = User.objects.create_user(
            username='confirmuser',
            email='confirm@example.com',
            password='OldPassword123!',
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            reverse('password_reset_confirm'),
            {
                'uid': uid,
                'token': token,
                'new_password': 'BrandNewPass123!',
                'new_password_confirm': 'BrandNewPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Confirm the user can authenticate with the new password
        login_res = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'confirmuser', 'password': 'BrandNewPass123!'},
            format='json',
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_password_reset_confirm_rejects_invalid_token(self):
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        user = User.objects.create_user(
            username='invalidtokenuser',
            email='invalidtoken@example.com',
            password='OldPassword123!',
        )

        uid = urlsafe_base64_encode(force_bytes(user.pk))

        response = self.client.post(
            reverse('password_reset_confirm'),
            {
                'uid': uid,
                'token': 'bogus-token-12345',
                'new_password': 'BrandNewPass123!',
                'new_password_confirm': 'BrandNewPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

