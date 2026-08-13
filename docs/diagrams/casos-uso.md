# Diagrama de casos de uso

Actores: **Usuario** (genera addendas) y **Administrador** (supervisa; no genera addendas).

```mermaid
flowchart LR
  usuario(["Usuario"])
  admin(["Administrador"])

  subgraph Cuenta
    uc1["Registrarse / Iniciar sesión"]
    uc2["Recuperar / restablecer contraseña"]
    uc3["Editar perfil / cambiar contraseña"]
    uc4["Consultar documentos legales\n(términos, privacidad, cookies)"]
  end
  subgraph Addendas
    uc5["Ver dashboard / estadísticas"]
    uc6["Seleccionar empresa y tipo de addenda"]
    uc7["Subir CFDI y generar addenda"]
    uc8["Ver historial"]
    uc9["Descargar XML"]
    uc10["Enviar por correo"]
  end
  subgraph Administración
    uc11["Ver usuarios registrados\n(con conteo de addendas)"]
  end

  usuario --> uc1 & uc2 & uc3 & uc4 & uc5 & uc6 & uc7 & uc8 & uc9 & uc10
  admin --> uc1 & uc2 & uc3 & uc4 & uc11
```

> Notas:
>
> - Las empresas y sus tipos de addenda (`configuracion_campos`) los da de alta el desarrollador directamente en la BD; ningún actor tiene un caso de uso de alta/edición desde la UI todavía.
> - El Administrador solo tiene acceso de lectura al listado de usuarios (`/admin/usuarios`); no hay gestión de empresas ni edición de otros usuarios implementada.
