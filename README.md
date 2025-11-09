💰 **Personal Finance Tracker**

**A full-stack web application that helps users manage their personal finances with ease.
It allows users to record income and expenses, set savings goals, view spending patterns through interactive charts, and export data for analysis.
Built using HTML, CSS, JavaScript (frontend) and Django REST Framework + MySQL (backend).**


## 🧾 Project Overview
**This project provides an intuitive way to manage personal finances.  
Users can securely log in, add transactions, view insights through charts, and set savings goals — all in a clean, responsive dashboard.**


## Features

-User Authentication (Signup/Login using JWT)
-Add Income & Expenses
-Dynamic Charts — view Income vs. Expense, Expense by Category, and Savings Over Time
-Set Savings Target and track progress visually
-Export Data as CSV
-Dark/Light Mode toggle
-Data stored in MySQL database
-Fully integrated Django REST API

## Tech Stack

1) Frontend:
-HTML5
-CSS3
-JavaScript
-Chart.js
2) Backend:
-Django
-Django REST Framework
-MySQL
-JWT Authentication
-CORS Headers

## ⚙️ Setup Instructions
1️) Clone the Repository
git clone https://github.com/shaili2005/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker/backend

2️) Create Virtual Environment
python -m venv venv
venv\Scripts\activate     # (on Windows)
# OR
source venv/bin/activate  # (on Mac/Linux)

3️) Install Dependencies
pip install -r requirements.txt

4️) Configure Database

In core/settings.py, update your MySQL credentials:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'finance_db',
        'USER': 'root',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}


Then run migrations:

python manage.py makemigrations
python manage.py migrate

5️) Run Server
python manage.py runserver

## NOTE: Open finance.html with live server on vs code

## Demo Credentials:
Username: shaili
Password: shaili

## Requirements
- Python 3.9 or above
- MySQL Server
- VS Code (for frontend Live Server)

## Screenshots of our project
<img width="1919" height="894" alt="image" src="https://github.com/user-attachments/assets/39e827d9-242d-4531-88ce-f1e3452086a8" />
<img width="1919" height="891" alt="image" src="https://github.com/user-attachments/assets/c15585c2-b18b-4eb1-a88b-537d512bd6a2" />
<img width="1919" height="890" alt="image" src="https://github.com/user-attachments/assets/d5306753-2e3f-4fe9-8b4c-cbacf2f9a38f" />
<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/5bad4f3c-350e-46ef-893b-796e15d7ebcd" />
<img width="1919" height="892" alt="image" src="https://github.com/user-attachments/assets/44aee457-6e1c-4e2e-845e-71036398f55d" />
<img width="1919" height="898" alt="image" src="https://github.com/user-attachments/assets/9e4e0bab-f10b-4b3f-bcad-6fd46f281cec" />


## Contributors
**Name & Role**
**Shaili Saxena	-- Backend Developer, Integration & Database
Soumya Saxena --	Frontend Developer & UI Designer**
