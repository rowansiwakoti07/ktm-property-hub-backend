from django.db import migrations

# Data structure of Nepal's states and districts
NEPAL_LOCATIONS = {
    "Koshi": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    "Madhesh": ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    "Bagmati": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    "Gandaki": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"],
    "Lumbini": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rupandehi", "Rukum East"],
    "Karnali": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Rukum West", "Salyan", "Surkhet"],
    "Sudurpashchim": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"],
}

def seed_data(apps, schema_editor):
    State = apps.get_model('ktmpropertyhub', 'State')
    District = apps.get_model('ktmpropertyhub', 'District')
    
    for state_name, districts in NEPAL_LOCATIONS.items():
        state_obj, created = State.objects.get_or_create(name=state_name)
        for district_name in districts:
            District.objects.get_or_create(state=state_obj, name=district_name)

class Migration(migrations.Migration):

    dependencies = [
        ('ktmpropertyhub', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data),
    ]