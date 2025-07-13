# 💰 Cuenta Clara

**Cuenta Clara** es una aplicación open source de gestión de finanzas personales desarrollada en React Native. Te permite llevar un control detallado de tus ingresos y gastos, todo almacenado localmente en tu dispositivo para máxima privacidad.

## 🌟 Características

- 📱 **Multiplataforma**: Funciona en Android, iOS y Web
- 🔒 **Privacidad Total**: Todos los datos se almacenan localmente en tu dispositivo
- 📊 **Reportes Detallados**: Visualiza tus finanzas con gráficos y estadísticas
- 🎯 **Presupuestos**: Establece y monitorea presupuestos por categoría
- 📋 **Categorización**: Organiza tus transacciones con categorías personalizables
- 💾 **Backup**: Exporta e importa tus datos fácilmente
- 🌍 **Multiidioma**: Soporte para español e inglés

## 🚀 Tecnologías

- **React Native** - Framework principal
- **TypeScript** - Tipado estático
- **AsyncStorage** - Almacenamiento local cross-platform
- **SQLite** - Base de datos local (móvil)
- **LocalStorage** - Almacenamiento web
- **React Navigation** - Navegación
- **React Native Paper** - Componentes UI

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### Configuración del Proyecto

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/cuenta-clara.git
cd cuenta-clara
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configuración iOS** (solo macOS)
```bash
cd ios && pod install && cd ..
```

4. **Ejecutar en desarrollo**

Para Android:
```bash
npm run android
```

Para iOS:
```bash
npm run ios
```

Para Web:
```bash
npm run web
```

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la aplicación
├── navigation/         # Configuración de navegación
├── services/           # Servicios de datos y lógica de negocio
├── types/             # Definiciones de tipos TypeScript
├── utils/             # Utilidades y helpers
└── assets/            # Recursos estáticos
```

### Almacenamiento de Datos

**Cuenta Clara** utiliza un sistema de almacenamiento híbrido:

- **Móvil (Android/iOS)**: AsyncStorage + SQLite (planeado para v2.0)
- **Web**: LocalStorage con estructura compatible

Todos los datos permanecen en tu dispositivo. No se envía información a servidores externos.

### Estructura de Datos

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

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}
```

## 📱 Funcionalidades

### Gestión de Transacciones
- ✅ Agregar ingresos y gastos
- ✅ Categorizar transacciones
- ✅ Editar y eliminar registros
- ✅ Búsqueda y filtros

### Análisis Financiero
- ✅ Balance mensual
- ✅ Estadísticas por categoría
- ✅ Tendencias de gastos
- 🔄 Reportes gráficos (en desarrollo)

### Presupuestos
- 🔄 Crear presupuestos por categoría (en desarrollo)
- 🔄 Monitoreo de límites (en desarrollo)
- 🔄 Alertas de sobregasto (en desarrollo)

### Backup y Sincronización
- ✅ Exportar datos a JSON
- ✅ Importar datos desde archivo
- 🔄 Backup automático (planeado)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Esto es un proyecto open source y cualquier ayuda es apreciada.

### Cómo Contribuir

1. **Fork** el proyecto
2. Crea una **branch** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la branch (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Reportar Bugs

Si encuentras un bug, por favor:

1. Verifica que no esté ya reportado en los [Issues](https://github.com/tu-usuario/cuenta-clara/issues)
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es aplicable
   - Información del dispositivo/navegador

### Sugerir Funcionalidades

¿Tienes una idea para mejorar Cuenta Clara? ¡Nos encantaría escucharla!

1. Revisa las [funcionalidades planeadas](https://github.com/tu-usuario/cuenta-clara/projects)
2. Crea un issue con la etiqueta "enhancement"
3. Describe tu idea detalladamente

## 🗺️ Roadmap

### v1.0 - Funcionalidades Básicas ✅
- [x] Gestión de transacciones
- [x] Categorización
- [x] Estadísticas básicas
- [x] Exportar/Importar datos

### v1.5 - Mejoras UX (En Desarrollo)
- [ ] Interfaz mejorada
- [ ] Gráficos interactivos
- [ ] Filtros avanzados
- [ ] Modo oscuro

### v2.0 - Funcionalidades Avanzadas (Planeado)
- [ ] Presupuestos completos
- [ ] Alertas y notificaciones
- [ ] Múltiples monedas
- [ ] Backup en la nube (opcional)
- [ ] Sincronización entre dispositivos

### v3.0 - Funcionalidades Pro (Futuro)
- [ ] Análisis predictivo
- [ ] Metas financieras
- [ ] Integración con bancos
- [ ] Recordatorios inteligentes

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [React Native](https://reactnative.dev/) por el framework
- [Expo](https://expo.dev/) por las herramientas de desarrollo
- La comunidad open source por la inspiración

## 📞 Contacto

- **Autor**: Tu Nombre
- **Email**: tu.email@ejemplo.com
- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)

---

**¿Te gusta Cuenta Clara?** ⭐ ¡Dale una estrella al repositorio!

**¿Encontraste un bug?** 🐛 [Reportalo aquí](https://github.com/tu-usuario/cuenta-clara/issues)

**¿Quieres contribuir?** 🤝 ¡Lee nuestra [guía de contribución](#-contribuir)!
