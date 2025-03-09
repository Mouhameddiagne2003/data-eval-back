
---

### **README.md pour le Back-end (Django)**

```markdown
# Data Eval - Back-end

API pour la gestion et l'évaluation automatisée des exercices de bases de données.

## Technologies Utilisées

- **Framework** : Django
- **Base de données** : PostgreSQL
- **API** : Django REST Framework (DRF)
- **Authentification** : JWT (JSON Web Tokens)
- **Modèle de langage** : DeepSeek (via Ollama ou API en ligne)
- **Tests** : PyTest, Django Test Framework
- **Linting** : Flake8, Black

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/mouhameddiagne2003/data-eval-backend.git
   cd data-eval-backend
2. Créer un environnement virtuel
    python -m venv venv
    source venv/bin/activate  # Sur macOS/Linux
    .\venv\Scripts\activate   # Sur Windows
3. Installer les dépendances
   pip install -r requirements.txt
4. Appliquer les migrations
   python manage.py migrate
5. Démarrer le serveur
   python manage.py runserver
