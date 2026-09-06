# Essa Packages

A modern, responsive packaging business website with product showcases, custom quote requests, WhatsApp integration, customer management, and a secure admin dashboard powered by Supabase.

## Overview

Essa Packages is a full-stack business website designed for a packaging company to present its products, receive customer inquiries and quotation requests, and manage business records through a secure admin panel.

The project combines a modern customer-facing website with backend services for authentication, quote management, and administrative operations.

## Features

### Customer Website

- Modern responsive design
- Product and packaging showcases
- Custom quotation request form
- WhatsApp integration
- Contact and inquiry management
- Mobile, tablet, and desktop support
- Fast and user-friendly interface

### Admin Dashboard

- Secure administrator authentication
- Quote request management
- Customer record management
- Administrative tools
- Private business data access
- Supabase-powered backend

### Backend & Deployment

- Supabase authentication
- Supabase database
- Secure environment variables
- Netlify Functions
- Netlify deployment support
- Protected API operations

## Tech Stack

- React
- JavaScript
- CSS
- Supabase
- PostgreSQL
- Netlify
- Netlify Functions
- Git & GitHub

## Project Structure

```text
Essa-Packages/
│
├── netlify/
│   └── functions/        # Serverless backend functions
│
├── public/               # Public assets
│
├── src/
│   ├── admin/            # Admin dashboard
│   ├── components/       # Reusable UI components
│   ├── context/          # React context
│   ├── lib/              # Utilities and integrations
│   └── types/            # Application types/data structures
│
├── supabase/
│   ├── migrations/       # Database migrations
│   └── schema.sql        # Database schema
│
├── .env.example          # Environment variable template
├── NETLIFY_SETUP.md      # Netlify and Supabase setup guide
├── netlify.toml          # Netlify configuration
├── package.json
└── README.md
