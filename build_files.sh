#!/bin/bash

echo "Installing pip if required..."
python3 -m ensurepip --upgrade
python3 -m pip install --upgrade pip

echo "Building the project..."
python3 -m pip install -r requirements.txt

echo "Make Migration..."
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput

echo "Collecting Static..."
python3 manage.py collectstatic --noinput --clear
echo "Static files collected in: $(ls staticfiles_build)"
