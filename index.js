import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 1) Set-up de la database :
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todolist",
  password: "2292951665",
  port: 5432,
});

// Connexion à la base de données
db.connect()
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.error("Error while connecting to the database", err);

  })
;


let items = [
  { id: 1, title: "Faire mon vocabulaire de japonais" },
  { id: 2, title: "Faire mes 10 000 pas" },
];

app.get("/", async (req, res) => {
  try {
    // Récupérer les tâches (items) depuis la base de données pour les afficher
    const result = await db.query("SELECT * FROM items");
    
    // Utiliser les résultats pour afficher et rendre les tâches dans la vue index.ejs
    const currentDate = new Date().toDateString();
    res.render("index.ejs", {
      listTitle: currentDate,
      listItems: result.rows,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches depuis la base de données', error);
    res.status(500).send('Erreur serveur');
  }
});


// Créer une fonction pour ajouter une tache à la base de données
async function addToDo(item) {
  try {
    const result = await db.query(
      "INSERT INTO items (title) VALUES ($1)",
      [item]
    );

    console.log('Tâche ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la tâche', error);
  }
}

// Ajouter un item à la to do list et à notre base de données
app.post("/add", (req, res) => {
  // Récupération de l'item de la requête post de notre formulaire grâce à bodyParser
  const item = req.body.newItem;
  items.push({ title: item });
  addToDo(item);
  res.redirect("/");
});

// Créer une fonction pour éditer/update une tache à la base de données
async function editToDo(item) {
  try {
    const result = await db.query(
      // Ici, on demande à la base de données et notre table "items" d'UPDATE la colonne title avec la valeur fournie dans le premier paramètre, à savoir $1.
      // Ensuite, avec WHERE id = $2, on met à jour la ligne où la valeur dans la colonne "id" correspond à la valeur du deuxième paramètre ($2).
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING *",
      [item]
    );

    console.log('Tâche ajoutée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la tâche', error);
  }
}


// Edit un item de la to do list
app.post("/edit", async (req, res) => {
  // Ici on récupère dans une variable l'item caché qui a la propriété hidden 
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});



// Supprimer un item de la to do list
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
