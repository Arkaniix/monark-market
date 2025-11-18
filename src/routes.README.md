# 🛣️ Système de Routes Protégées

Ce projet utilise un système centralisé de configuration des routes avec protection automatique basée sur l'authentification et les rôles.

## 📁 Fichiers

- **`src/routes.tsx`** : Configuration centralisée de toutes les routes
- **`src/components/ProtectedRoute.tsx`** : Composant pour protéger les routes
- **`src/pages/Unauthorized.tsx`** : Page affichée pour les accès non autorisés
- **`src/App.tsx`** : Utilise la configuration pour générer les routes

## 🎯 Configuration d'une route

Dans `src/routes.tsx`, chaque route est définie avec :

```typescript
{
  path: "/mon-chemin",           // Le chemin de la route
  component: MaPage,              // Le composant à afficher
  requiresAuth: true,             // (optionnel) Nécessite d'être connecté
  requiresAdmin: true,            // (optionnel) Nécessite le rôle admin
}
```

### Exemples

```typescript
// Route publique (accessible à tous)
{
  path: "/cgu",
  component: CGU,
  requiresAuth: false,
}

// Route authentifiée (nécessite d'être connecté)
{
  path: "/deals",
  component: Deals,
  requiresAuth: true,
}

// Route admin (nécessite d'être admin)
{
  path: "/admin",
  component: Admin,
  requiresAuth: true,
  requiresAdmin: true,
}
```

## ✨ Fonctionnement

### 1. Redirection automatique

Le composant `ProtectedRoute` gère automatiquement :

- **Si `requiresAuth: true`** et utilisateur non connecté → Redirection vers `/auth`
- **Si `requiresAdmin: true`** et utilisateur non admin → Redirection vers `/unauthorized`
- Sinon → Affichage de la page demandée

### 2. État d'authentification

Actuellement géré par Supabase dans `App.tsx` :

```typescript
const [user, setUser] = useState<User | null>(null);
const [isAdmin, setIsAdmin] = useState(false);
```

### 3. Vérification des rôles

La vérification admin se fait via la table `user_roles` de Supabase :

```typescript
const checkAdminStatus = async (userId: string) => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  setIsAdmin(data?.some(row => row.role === 'admin'));
};
```

## 🔄 Intégration avec votre backend FastAPI

Quand vous voudrez brancher votre vrai backend FastAPI, voici ce qu'il faudra adapter :

### Option 1 : Utiliser un AuthContext

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, setAccessToken, clearAccessToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérifier si un token existe au chargement
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await apiGet<User>('/v1/auth/me');
      setUser(profile);
      setIsAdmin(profile.role === 'admin');
    } catch (error) {
      clearAccessToken();
      setUser(null);
      setIsAdmin(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiPost<LoginResponse>('/v1/auth/login', {
      email,
      password,
    });
    
    setAccessToken(response.access_token);
    await loadUserProfile();
  };

  const logout = () => {
    clearAccessToken();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Option 2 : Adapter App.tsx directement

Remplacez la logique Supabase par des appels à votre API :

```typescript
// Dans App.tsx
const checkAuthStatus = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    setUser(null);
    setIsAdmin(false);
    return;
  }

  try {
    const profile = await apiGet<User>('/v1/auth/me');
    setUser(profile);
    setIsAdmin(profile.role === 'admin');
  } catch (error) {
    // Token invalide ou expiré
    clearAccessToken();
    setUser(null);
    setIsAdmin(false);
  }
};

useEffect(() => {
  checkAuthStatus();
}, []);
```

## 📝 Ajouter une nouvelle route

1. Créez votre page dans `src/pages/`
2. Ajoutez la configuration dans `src/routes.tsx` :

```typescript
import MaNouvellePagePage from "./pages/MaNouvellePage";

export const routes: RouteConfig[] = [
  // ... autres routes
  {
    path: "/ma-nouvelle-page",
    component: MaNouvellePagePage,
    requiresAuth: true,  // selon vos besoins
  },
  // ... 
];
```

3. C'est tout ! La route est automatiquement protégée selon votre configuration.

## 🔒 Sécurité

⚠️ **Important** : La protection côté frontend n'est PAS suffisante !

- Ces redirections protègent uniquement l'**expérience utilisateur**
- Vous **DEVEZ** aussi protéger vos endpoints API côté backend
- Vérifiez toujours les permissions sur le serveur

### Backend FastAPI - Exemple de protection

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Vérifier le token et retourner l'utilisateur
    user = verify_token(token.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

async def require_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@app.get("/v1/admin/users", dependencies=[Depends(require_admin)])
async def get_users():
    # Cette route est protégée côté serveur
    return {"users": [...]}
```

## 🎨 Personnalisation

### Changer la page d'authentification

Modifiez le path dans `ProtectedRoute.tsx` :

```typescript
if (requiresAuth && !user) {
  return <Navigate to="/login" replace />;  // Au lieu de /auth
}
```

### Changer la page non autorisé

Modifiez le path dans `ProtectedRoute.tsx` :

```typescript
if (requiresAdmin && !isAdmin) {
  return <Navigate to="/forbidden" replace />;  // Au lieu de /unauthorized
}
```

### Ajouter d'autres types de permissions

Vous pouvez étendre `RouteConfig` :

```typescript
export interface RouteConfig {
  path: string;
  component: ComponentType;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresModerator?: boolean;  // Nouveau
  requiresPremium?: boolean;     // Nouveau
}
```

Puis adapter `ProtectedRoute` en conséquence.

## 🚀 Prochaines étapes

1. Terminez votre backend FastAPI avec les endpoints d'authentification
2. Créez votre `AuthContext` ou adaptez `App.tsx`
3. Remplacez les appels Supabase par les appels à votre API
4. Testez les redirections et protections
5. Implémentez la protection côté serveur (CRUCIAL !)

Bon développement ! 🎉
