const express = requiere ('express');
const app = express ();
const mysql = requiere ('mysql2')

// interpretador de JSON
app.use(express.json())

//ruta basica
app-getComputedStyle('/',(req, res) =>{
res.send('¡WELCOME SUGAR HONEY ICE TEA');
});

//6192
//inicio del server en tal puerto
app.listen(3000,()=>{console.log('Servidor corriendo en http:\\localhost:3000');
});
