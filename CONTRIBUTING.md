# 🤝 Guía de Contribución - Cuenta Clara

¡Gracias por tu interés en contribuir a **Cuenta Clara**! Este proyecto es open source y todas las contribuciones son bienvenidas.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)
- [Pull Requests](#pull-requests)

## 🤝 Código de Conducta

Este proyecto se adhiere a un código de conducta que todos los contribuidores deben seguir:

- **Sé respetuoso** con otros contribuidores
- **Acepta las críticas constructivas** graciosamente
- **Enfócate en lo que es mejor** para la comunidad
- **Muestra empatía** hacia otros miembros de la comunidad

## 🚀 ¿Cómo puedo contribuir?

Hay muchas formas de contribuir a Cuenta Clara:

### 🐛 Reportar Bugs
- Busca en los [issues existentes](https://github.com/tu-usuario/cuenta-clara/issues) antes de crear uno nuevo
- Incluye pasos detallados para reproducir el bug
- Proporciona información del dispositivo/navegador

### 💡 Sugerir Funcionalidades
- Revisa las [funcionalidades planeadas](https://github.com/tu-usuario/cuenta-clara/projects)
- Describe claramente el problema que resuelve tu sugerencia
- Incluye mockups o ejemplos si es posible

### 📚 Mejorar Documentación
- Corregir errores de ortografía o gramática
- Agregar ejemplos o aclaraciones
- Traducir a otros idiomas

### 💻 Contribuir con Código
- Implementar nuevas funcionalidades
- Corregir bugs
- Mejorar rendimiento
- Escribir tests

## 🛠️ Configuración del Entorno

### Prerrequisitos

- **Node.js** 18+ 
- **npm** o **yarn**
- **React Native CLI**
- **Android Studio** (para desarrollo Android)
- **Xcode** (para desarrollo iOS - solo macOS)

### Instalación

1. **Fork** el repositorio
2. **Clona** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/cuenta-clara.git
   cd cuenta-clara
   ```

3. **Instala** las dependencias:
   ```bash
   npm install
   ```

4. **Configura** el entorno según tu plataforma:
   
   **Para Android:**
   ```bash
   # Asegúrate de tener Android Studio configurado
   npm run android
   ```
   
   **Para iOS** (solo macOS):
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```
   
   **Para Web:**
   ```bash
   npm run web
   ```

## 📋 Flujo de Trabajo

### 1. Crear una Branch

```bash
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b bugfix/descripcion-del-bug
```

### 2. Hacer Cambios

- Sigue las [convenciones de código](#estándares-de-código)
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 3. Commit

Usa mensajes de commit descriptivos siguiendo el formato:

```
tipo(ámbito): descripción breve

Descripción más detallada si es necesaria.

Resuelve #123
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato, no funcionales
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat(transactions): agregar filtro por categoría"
git commit -m "fix(database): corregir error de sincronización"
git commit -m "docs(readme): actualizar instrucciones de instalación"
```

### 4. Push y Pull Request

```bash
git push origin feature/nombre-de-tu-feature
```

Luego crea un Pull Request desde GitHub.

## 📏 Estándares de Código

### TypeScript
- Usar **TypeScript** para todo el código nuevo
- Definir interfaces para todas las estructuras de datos
- Evitar el uso de `any`

### Naming Conventions
- **camelCase** para variables y funciones
- **PascalCase** para componentes React
- **UPPER_SNAKE_CASE** para constantes

### Estructura de Archivos
```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes genéricos
│   └── specific/       # Componentes específicos
├── screens/            # Pantallas de la aplicación
├── services/           # Lógica de negocio y APIs
├── utils/              # Utilidades y helpers
├── types/              # Definiciones de tipos
└── navigation/         # Configuración de navegación
```

### Componentes React
```typescript
// ✅ Bueno
interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
}) => {
  // Component logic
};

// ❌ Evitar
export default function TransactionList(props: any) {
  // ...
}
```

### Imports
```typescript
// ✅ Orden correcto de imports
import React from 'react';
import { View, Text } from 'react-native';

import { Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TransactionItem } from './TransactionItem';
```

## 🐛 Reportar Bugs

Al reportar un bug, incluye:

### 📝 Información Básica
- **Descripción clara** del problema
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** o videos si es aplicable

### 🔧 Información Técnica
- **Versión** de la aplicación
- **Plataforma** (Android/iOS/Web)
- **Versión del OS**
- **Dispositivo** o navegador

### 📋 Template de Bug Report
```markdown
## Descripción
Breve descripción del bug

## Pasos para Reproducir
1. Ir a...
2. Hacer clic en...
3. Ver error

## Comportamiento Esperado
Lo que debería pasar

## Comportamiento Actual
Lo que realmente pasa

## Screenshots
Si aplica

## Información del Entorno
- Plataforma: [Android/iOS/Web]
- Versión: [e.g. 1.0.0]
- Dispositivo: [e.g. iPhone 12, Samsung Galaxy S21]
- OS: [e.g. iOS 15.0, Android 11]
```

## 💡 Sugerir Funcionalidades

### Template de Feature Request
```markdown
## Resumen
Breve descripción de la funcionalidad

## Problema que Resuelve
¿Qué problema actual resuelve esta funcionalidad?

## Solución Propuesta
Descripción detallada de cómo funcionaría

## Alternativas Consideradas
Otras formas de resolver el problema

## Información Adicional
Mockups, ejemplos, referencias, etc.
```

## 🔄 Pull Requests

### Checklist para PRs

Antes de enviar tu PR, asegúrate de que:

- [ ] El código sigue las [convenciones de estilo](#estándares-de-código)
- [ ] Todos los tests pasan (`npm test`)
- [ ] El código funciona en todas las plataformas objetivo
- [ ] La documentación está actualizada
- [ ] Los commits tienen mensajes descriptivos
- [ ] La branch está actualizada con `main`

### Descripción del PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💥 Breaking change
- [ ] 📚 Documentación
- [ ] 🎨 Refactoring

## ¿Cómo se ha Probado?
Describe las pruebas realizadas

## Screenshots
Si aplica

## Checklist
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Código revisado
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage
```

### Escribir Tests
```typescript
// __tests__/TransactionService.test.ts
import { dataService } from '../services/dataService';

describe('DataService', () => {
  beforeEach(() => {
    // Setup
  });

  test('should add transaction correctly', async () => {
    const transaction = {
      amount: 100,
      categoryId: '1',
      description: 'Test transaction',
      type: 'expense' as const,
      date: new Date(),
    };

    const id = await dataService.addTransaction(transaction);
    expect(id).toBeDefined();
  });
});
```

## 📱 Testing en Dispositivos

### Android
```bash
# Ejecutar en emulador
npm run android

# Ejecutar en dispositivo físico
adb devices
npm run android
```

### iOS (solo macOS)
```bash
# Ejecutar en simulador
npm run ios

# Ejecutar en dispositivo físico
npm run ios --device
```

### Web
```bash
# Servidor de desarrollo
npm run web

# Build para producción
npm run build:web
```

## 📊 Estructura de Datos

Al trabajar con datos, sigue estas interfaces:

```typescript
interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  type: 'income' | 'expense';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}
```

## 🎨 UI/UX Guidelines

- Sigue los principios de **Material Design**
- Mantén **consistencia** en colores y tipografía
- Asegura **accesibilidad** (contraste, tamaños de texto)
- Diseña **responsive** para diferentes tamaños de pantalla
- Prioriza la **usabilidad** sobre la estética

## 🚀 Deploy y Release

Los maintainers se encargan del proceso de release:

1. **Merge** de PRs aprobados
2. **Update** de versión en `package.json`
3. **Generate** release notes
4. **Deploy** a las tiendas correspondientes

## ❓ ¿Necesitas Ayuda?

- 📖 Revisa la [documentación](README.md)
- 💬 Únete a las [discusiones](https://github.com/tu-usuario/cuenta-clara/discussions)
- 📧 Contacta a los maintainers

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en:
- Lista de contribuidores en el README
- Release notes
- Créditos en la aplicación

---

¡Gracias por contribuir a **Cuenta Clara**! 🎉

Tu ayuda hace que esta aplicación sea mejor para todos. 💪
