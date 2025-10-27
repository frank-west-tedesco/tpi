# Guía de Implementación de Notas entre Vistas

## Resumen de Cambios Realizados

1. **Configuración de API**:
   - Se agregó la ruta `/api/get_notas` en `app2.js` para servir las notas a los alumnos
   - Se utiliza el archivo `get_notas.js` para manejar la lógica de obtención de notas

2. **Vista de Alumno**:
   - Se modificó `GuevaraNotas_PerspectivaAlumno3.html` para cargar notas desde la API
   - Se corrigió la URL de la API para usar rutas relativas

## Cómo Aplicar a Otras Vistas

### Para Vistas de Administrador (Ladmin)
- `GuevaraNotas_PerspectivaLadmin2.html` y `GuevaraNotas_perspectivaLadmin.html`
- Estas vistas ya pueden guardar notas usando `/api/notas`

### Para Vistas de Departamento
- `GuevaraNotas_PerspectivaDep_alumnado3.html`, `GuevaraNotas_PerspectivaDep_Alumnado.html` y `GuevaraNotas_PerspectivaDep_alumna2.html`
- Deben usar el mismo endpoint `/api/notas` para guardar notas
- Verificar que tengan los permisos adecuados

### Para Vistas de Alumnos
- `GuevaraNotas_PerspectivaAlumno.HTML` y `GuevaraNotas_PerspectivaAlumno2.html`
- Copiar la función `cargarNotas()` de `GuevaraNotas_PerspectivaAlumno3.html`
- Asegurarse de que usen `/api/get_notas/{ID_usuario}` para obtener sus notas

## Estructura de Datos

La API devuelve un array de objetos con esta estructura:
```json
[
  {
    "materia": "Nombre de la materia",
    "primer": "9.50",
    "segundo": "8.75",
    "tercero": "9.00",
    "comentarios": "Comentario del profesor"
  }
]
```

Si no hay notas, se devuelven materias predeterminadas con valores nulos.