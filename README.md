# Renacer · Pruebas del chatbot

Prototipo público y estático del centro de operaciones y del asistente de admisión de Renacer. Solo datos ficticios; no utilizar con pacientes reales.

## Ejecutar localmente

Desde esta carpeta, ejecuta:

```sh
python -m http.server 4173
```

Abre `http://localhost:4173/`.

## Publicar en GitHub Pages

En el repositorio, entra a **Settings → Pages**, elige **Deploy from a branch** y selecciona la rama `main` y la carpeta `/ (root)`. Guarda la configuración. GitHub mostrará la dirección del sitio cuando termine de publicarlo.

## Probar el chatbot

1. Pulsa **Asistente Renacer**, abajo a la derecha.
2. Selecciona el servicio y el horario.
3. Usa el nombre **Paciente Prueba** y el número **999999999**.
4. Acepta el consentimiento y envía la solicitud.
5. Pulsa **Ver en la bandeja** para comprobar el registro.
6. Pulsa **Atender** y verifica la asignación a Equipo ATC y la ficha.

También puedes comprobar los filtros, la búsqueda y el registro manual de pacientes. Al cerrar y abrir el chatbot se conserva el avance; al recargar la página se reinicia la demostración.

## Alcance

- Los datos son ejemplos ficticios; los profesionales se identifican por números.
- No se envían mensajes por WhatsApp ni se crean eventos de Google Calendar o Meet.
- No hay base de datos ni almacenamiento permanente.
- No incluye exportaciones de Psicobit, historiales clínicos, credenciales ni la configuración del alojamiento original.
- El enlace `#registro` abre directamente el chatbot al cargar la página.

Este sitio de pruebas no debe utilizarse para recibir datos reales de pacientes.
