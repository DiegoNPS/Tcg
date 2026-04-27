# TCG Hub — Plataforma de Torneos de Trading Card Games

> Plataforma web centralizada para descubrir, publicar e inscribirse en torneos de TCG (Trading Card Games) en Chile.

\---

## Descripción

**TCG Hub** resuelve la falta de un sistema centralizado para coordinar eventos de cartas coleccionables. Actualmente, los torneos se difunden de forma fragmentada a través de grupos de WhatsApp y publicaciones en Instagram, lo que dificulta la asistencia de jugadores y reduce el revenue de las tiendas organizadoras.

Esta plataforma permite que:

* **Tiendas** publiquen y administren sus torneos.
* **Jugadores** descubran eventos, los filtren por sus preferencias y se inscriban fácilmente.

\---

## Objetivos

* Centralizar la difusión de eventos TCG en una sola plataforma.
* Facilitar la inscripción de participantes a torneos.
* Facilitar la familiarización con los distintos tipos de TCG.

\---

## Stack Tecnológico

|Capa|Tecnología|
|-|-|
|Frontend|Next.js 14 (App Router, SSR/SSG, RSC)|
|Backend|Supabase (BaaS) + API Routes|
|Base de Datos|PostgreSQL (Supabase)|
|Autenticación|Supabase Auth (OAuth + Email)|
|Almacenamiento|Supabase Storage (imágenes/banners)|
|Seguridad|Row Level Security (RLS)|
|Deployment|Vercel (Serverless + Edge Network)|
|Lenguajes|JavaScript, SQL|

\---

## Arquitectura

La aplicación sigue una arquitectura **serverless** con separación entre Client-Side UI y Server-Side Components:

```
Cliente (Browser)
    │
    ▼
Next.js (Vercel Edge)
    ├── Client Components  →  UI interactiva
    └── Server Components  →  SSR / SSG / API Routes
            │
            ▼
       Supabase
       ├── PostgreSQL  →  Torneos, Tiendas, Inscripciones
       ├── Auth        →  OAuth / Email
       └── Storage     →  Logos, banners
```

\---

## Modelo de Datos (inicial)

* `tiendas` — Perfil de tiendas organizadoras
* `torneos` — Eventos publicados por las tiendas
* `inscripciones` — Registro de jugadores a torneos

\---

## Funcionalidades Principales

* \[ ] Registro e inicio de sesión (tiendas y jugadores)
* \[ ] Listado de torneos con filtros
* \[ ] Publicación de torneos (exclusivo para tiendas)
* \[ ] Inscripción a torneos
* \[ ] Panel de administración para tiendas

\---

## Equipo

|Nombre|Rol|
|-|-|
|Álvaro Cabezas P.|Líder / Analista Funcional|
|Diego Peña S.|DBA / Frontend|
|Federico Pereira|Backend / Otros|

**Docente:** Diego Cares  
**Institución:** DUOC UC  
**Fecha inicio:** Abril 2026

\---

## Instalación y Desarrollo

> Requisitos previos: Node.js 18+, cuenta en Supabase, cuenta en Vercel.

```bash
# Clonar el repositorio
git clone https://github.com/federico-pereira/TCG_Pegela.git
cd <TCG_Pegela>

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Completar NEXT\\\_PUBLIC\\\_SUPABASE\\\_URL y NEXT\\\_PUBLIC\\\_SUPABASE\\\_ANON\\\_KEY

# Iniciar servidor de desarrollo
npm run dev
```

\---

## Demo

*Próximamente.*

\---

## Licencia

Este proyecto fue desarrollado con fines académicos en el marco del programa de **Ingeniería en Informática** de DUOC UC.
