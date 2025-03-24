
---

### **README.md pour le Back-end (Express)**

```markdown
# 🚀 Data Eval - Back-end

API pour la gestion et la correction automatisée d'exercices SQL avec **DeepSeek (Ollama)**.

---

## ⚙️ **Stack Technique**
| Technologie | Description |
|-------------|-------------|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Environnement d'exécution JavaScript |
| ![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) | Framework backend minimaliste |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white) | Base de données relationnelle |
| ![Ollama](https://img.shields.io/badge/Ollama-00A86B?style=flat-square) | Serveur local de LLM pour correction automatisée |
| ![DeepSeek](https://img.shields.io/badge/DeepSeek%20Model-FF9900?style=flat-square) | Modèle IA utilisé pour générer et corriger des requêtes SQL |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | Authentification sécurisée |
| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=white) | Stockage des fichiers d'examen |

## 📁 **Architecture principale**

📦 data-eval-back (src)┣ 📂 controllers ┣ 📂 routes ┣ 📂 models ┣ 📂 services ┣ 📂 middlewares ┣ 📂 utils ┣ 📜 server.js  ┗ 📜 package.json

## ✅ **Fonctionnalités**
- Authentification (Professeurs et Administrateurs)
- Création et gestion des examens
- Envoi automatique des requêtes à DeepSeek pour correction
- Téléchargement des fichiers d'examen via backend
- Soumission des devoirs par les étudiants
- Enregistrement des notes et rapports de correction
- Gestion sécurisée des accès avec JWT

## 🚀 **Installation**

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/mouhameddiagne2003/data-eval-back.git
cd data-eval-back

npm install

PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/data_eval
JWT_SECRET=ta_clé_secrète
OLLAMA_URL=http://localhost:11434 exemple
USER_EMAIL=...
USER_PASSWD=...
PRIVATE_KEY_ID=...

demarrer le projet
npm run dev

