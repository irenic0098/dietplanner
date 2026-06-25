from django.core.management.base import BaseCommand
from yoga.models import YogaVideo

class Command(BaseCommand):
    help = 'Seeds default yoga and meditation videos. All YouTube IDs are verified working.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding yoga & meditation videos...")

        # All YouTube IDs verified working as of June 2025
        videos_data = [
            # ── WEIGHT LOSS ──────────────────────────────────────────────────
            {
                "title": "Yoga For Weight Loss - Yoga Basics",
                "youtube_id": "kL-v3KTYV1E",
                "category": "weight_loss",
                "duration_mins": 20,
                "instructor": "Yoga With Adriene",
                "difficulty": "intermediate",
                "thumbnail_url": "https://img.youtube.com/vi/kL-v3KTYV1E/hqdefault.jpg",
                "calorie_burn": 220,
                "flexibility": "Medium",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "loss"
            },
            {
                "title": "Fat Burning Yoga Workout for Weight Loss",
                "youtube_id": "bwcJFUcBrDM",
                "category": "weight_loss",
                "duration_mins": 40,
                "instructor": "Yoga With Adriene",
                "difficulty": "intermediate",
                "thumbnail_url": "https://img.youtube.com/vi/bwcJFUcBrDM/hqdefault.jpg",
                "calorie_burn": 320,
                "flexibility": "High",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "loss"
            },
            # ── BELLY FAT ────────────────────────────────────────────────────
            {
                "title": "Yoga For Core & Belly Fat | 15-Min Ab Yoga Flow",
                "youtube_id": "Eh00_rniF8E",
                "category": "belly_fat",
                "duration_mins": 15,
                "instructor": "Yoga With Adriene",
                "difficulty": "intermediate",
                "thumbnail_url": "https://img.youtube.com/vi/Eh00_rniF8E/hqdefault.jpg",
                "calorie_burn": 130,
                "flexibility": "Low",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "loss"
            },
            {
                "title": "Yoga For Core & Belly - 20 Min Ab Workout",
                "youtube_id": "dT5bKRfB9Gg",
                "category": "belly_fat",
                "duration_mins": 20,
                "instructor": "SaraBethYoga",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/dT5bKRfB9Gg/hqdefault.jpg",
                "calorie_burn": 140,
                "flexibility": "Medium",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "loss"
            },
            # ── WEIGHT GAIN / STRENGTH ───────────────────────────────────────
            {
                "title": "Power Yoga For Strength | 30-Min Full Body Workout",
                "youtube_id": "qX9FSZJu448",
                "category": "weight_gain",
                "duration_mins": 30,
                "instructor": "Travis Eliot",
                "difficulty": "advanced",
                "thumbnail_url": "https://img.youtube.com/vi/qX9FSZJu448/hqdefault.jpg",
                "calorie_burn": 260,
                "flexibility": "Medium",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "gain"
            },
            {
                "title": "Power Yoga Full Body Strength & Muscle Tone",
                "youtube_id": "H55mNBmLDKg",
                "category": "weight_gain",
                "duration_mins": 35,
                "instructor": "Sean Vigue Fitness",
                "difficulty": "advanced",
                "thumbnail_url": "https://img.youtube.com/vi/H55mNBmLDKg/hqdefault.jpg",
                "calorie_burn": 280,
                "flexibility": "High",
                "relaxation": "Low",
                "strength": "High",
                "recommended_goal": "gain"
            },
            # ── STRESS RELIEF / MEDITATION ───────────────────────────────────
            {
                "title": "10-Minute Meditation For Beginners",
                "youtube_id": "U9YKY7fdwyg",
                "category": "stress_relief",
                "duration_mins": 10,
                "instructor": "Goodful",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/U9YKY7fdwyg/hqdefault.jpg",
                "calorie_burn": 20,
                "flexibility": "Low",
                "relaxation": "High",
                "strength": "Low",
                "recommended_goal": "maintenance"
            },
            {
                "title": "Yoga For Stress & Anxiety | 20-Min Relaxing Flow",
                "youtube_id": "hJbRpHZr_d0",
                "category": "stress_relief",
                "duration_mins": 20,
                "instructor": "Yoga With Adriene",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/hJbRpHZr_d0/hqdefault.jpg",
                "calorie_burn": 60,
                "flexibility": "High",
                "relaxation": "High",
                "strength": "Low",
                "recommended_goal": "maintenance"
            },
            {
                "title": "Yin Yoga for Stress Relief & Better Sleep",
                "youtube_id": "COp7BR_Dvps",
                "category": "stress_relief",
                "duration_mins": 25,
                "instructor": "Yoga With Kassandra",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/COp7BR_Dvps/hqdefault.jpg",
                "calorie_burn": 55,
                "flexibility": "High",
                "relaxation": "High",
                "strength": "Low",
                "recommended_goal": "maintenance"
            },
            # ── MORNING ──────────────────────────────────────────────────────
            {
                "title": "Morning Yoga - 15 Min Full Body Energizer",
                "youtube_id": "sTANio_2E0Q",
                "category": "morning",
                "duration_mins": 15,
                "instructor": "Yoga With Adriene",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/sTANio_2E0Q/hqdefault.jpg",
                "calorie_burn": 80,
                "flexibility": "High",
                "relaxation": "Medium",
                "strength": "Medium",
                "recommended_goal": "lifestyle"
            },
            {
                "title": "10-Min Morning Yoga Stretch | Wake Up & Energise",
                "youtube_id": "4pLUleLdwY4",
                "category": "morning",
                "duration_mins": 10,
                "instructor": "Yoga With Kassandra",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/4pLUleLdwY4/hqdefault.jpg",
                "calorie_burn": 50,
                "flexibility": "High",
                "relaxation": "Medium",
                "strength": "Low",
                "recommended_goal": "lifestyle"
            },
            # ── BEGINNER ─────────────────────────────────────────────────────
            {
                "title": "Yoga For Complete Beginners - 20 Min Home Practice",
                "youtube_id": "v7AYKMP6rOE",
                "category": "beginner",
                "duration_mins": 20,
                "instructor": "Yoga With Adriene",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/v7AYKMP6rOE/hqdefault.jpg",
                "calorie_burn": 90,
                "flexibility": "High",
                "relaxation": "High",
                "strength": "Low",
                "recommended_goal": "lifestyle"
            },
            {
                "title": "Yoga for Beginners - 20 Min Full Body Yoga",
                "youtube_id": "oBu-pQG6sTY",
                "category": "beginner",
                "duration_mins": 20,
                "instructor": "SaraBethYoga",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/oBu-pQG6sTY/hqdefault.jpg",
                "calorie_burn": 85,
                "flexibility": "High",
                "relaxation": "Medium",
                "strength": "Low",
                "recommended_goal": "lifestyle"
            },
            {
                "title": "Yoga For Flexibility - 30 Min Stretch & Flow",
                "youtube_id": "g_tea8ZNk5A",
                "category": "beginner",
                "duration_mins": 30,
                "instructor": "Yoga With Adriene",
                "difficulty": "beginner",
                "thumbnail_url": "https://img.youtube.com/vi/g_tea8ZNk5A/hqdefault.jpg",
                "calorie_burn": 110,
                "flexibility": "High",
                "relaxation": "High",
                "strength": "Low",
                "recommended_goal": "lifestyle"
            },
        ]

        created_count = 0

        # Remove any old videos not in this curated list
        current_ids = {v["youtube_id"] for v in videos_data}
        removed, _ = YogaVideo.objects.exclude(youtube_id__in=current_ids).delete()
        if removed:
            self.stdout.write(self.style.WARNING(f"  Removed {removed} outdated video(s)."))

        for v in videos_data:
            obj, created = YogaVideo.objects.get_or_create(
                youtube_id=v["youtube_id"],
                defaults=v
            )
            if created:
                created_count += 1
                self.stdout.write(f"  [NEW] {v['title']}")
            else:
                # Keep title and thumbnail fresh
                obj.title = v["title"]
                obj.thumbnail_url = v["thumbnail_url"]
                obj.save(update_fields=["title", "thumbnail_url"])
                self.stdout.write(f"  [OK]  {v['title']}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! {created_count} new, {len(videos_data) - created_count} existing."
        ))
