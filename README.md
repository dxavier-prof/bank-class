# 🏦 Banco Escolar

Juego de compra y venta para el aula. El maestro/a actúa como **banquero**: entrega dinero (billetes de $5, $10, $20, $50 y $100) y vende artículos de una tienda. Cada estudiante tiene su propia **billetera** que se actualiza en tiempo real con Firebase.

- `index.html` — pantalla de inicio, elegir rol
- `teacher.html` — panel del banquero (protegido con PIN)
- `student.html` — billetera del estudiante
- `js/bank.js` — funciones que hablan con Firestore
- `js/firebase-config.js` — **aquí van tus claves de Firebase**

## 1. Crear el proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto**.
2. Dentro del proyecto: **Compilación → Firestore Database → Crear base de datos** (modo producción o prueba, ambos sirven para empezar).
3. Ve a **⚙️ Configuración del proyecto → General → Tus apps → Agregar app → Web (`</>`)**.
4. Copia el objeto `firebaseConfig` que te muestra y pégalo en `js/firebase-config.js`, reemplazando los valores `TU_...`.
5. En ese mismo archivo, cambia `TEACHER_PIN` por el PIN que usarás tú como maestro/a para entrar al panel del banquero.

## 2. Reglas de seguridad de Firestore (recomendado)

El PIN del panel del banquero es solo una barrera visual en el navegador, **no** una regla de seguridad real. Para una clase, lo más simple es limitar la escritura a lo que la app necesita. En Firebase Console → Firestore Database → Reglas, puedes usar algo como:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read: if true;
      allow write: if true; // dentro del aula esto suele ser suficiente
      match /movimientos/{movId} {
        allow read, write: if true;
      }
    }
    match /tienda/{itemId} {
      allow read, write: if true;
    }
  }
}
```

Si más adelante quieres endurecerlo (por ejemplo, con Firebase Authentication para el maestro), esa regla es el punto de partida a modificar.

## 3. Probarlo localmente

Como usa módulos de JavaScript (`type="module"`), no puedes abrir `index.html` con doble clic; necesita un servidor local:

```bash
npx serve .
# o
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## 4. Publicarlo en GitHub Pages

1. Crea un repositorio en GitHub y sube todo el contenido de esta carpeta a la raíz del repositorio (o a una carpeta `docs/`, como prefieras).
2. En GitHub: **Settings → Pages → Source**, elige la rama (`main`) y la carpeta (`/root` o `/docs`).
3. Guarda. En un par de minutos tu sitio estará disponible en `https://tu-usuario.github.io/tu-repositorio/`.

```bash
git init
git add .
git commit -m "Banco escolar: primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## Cómo se usa en clase

1. Tú (maestro/a) entras a `teacher.html`, ingresas tu PIN.
2. En la pestaña **Tienda**, agregas los artículos que los estudiantes podrán comprar (nombre, precio, emoji).
3. En **Estudiantes**, agregas a cada alumno una sola vez (queda guardado para siempre en Firestore).
4. Cuando quieras darle dinero a alguien: selecciónalo en la lista y toca los billetes ($5, $10, $20, $50, $100) hasta llegar al monto que quieres entregar, luego **Entregar dinero**.
5. Cuando un estudiante te "compre" algo físicamente, selecciónalo, toca el artículo en **Vender artículo** y confirma. El sistema descuenta el saldo automáticamente (y avisa si no le alcanza).
6. Los estudiantes entran a `student.html` desde cualquier dispositivo, tocan su nombre una vez (queda recordado en ese dispositivo) y ven su saldo y su historial actualizarse en tiempo real.

## Ideas para ampliar

- Pedir un PIN de 4 dígitos por estudiante antes de mostrar su billetera (ya existe el campo `pin` en el modelo de datos, solo falta la pantalla de verificación).
- Agregar una vista de "ranking de ahorro" para el proyector del salón.
- Registrar Firebase Authentication para que el PIN del banquero sea una regla real de Firestore.
