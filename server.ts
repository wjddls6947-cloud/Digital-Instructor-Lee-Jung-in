import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin Initialization
let firebaseApp: admin.app.App | null = null;
let firestore: admin.firestore.Firestore | null = null;
let bucket: any = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
    firestore = firebaseApp.firestore();
    bucket = firebaseApp.storage().bucket();
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

const db = new Database("gallery.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM gallery").get() as { count: number };
if (count.count === 0) {
  const initialData = [
    { title: 'AI 교육 현장', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800', year: '2025년' },
    { title: '코딩 캠프', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800', year: '2025년' },
    { title: '디지털 새싹', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800', year: '2024년' }
  ];
  const insert = db.prepare("INSERT INTO gallery (title, image, year) VALUES (?, ?, ?)");
  initialData.forEach(item => insert.run(item.title, item.image, item.year));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2000mb' }));
  app.use(express.urlencoded({ limit: '2000mb', extended: true }));

  // Ensure upload directory exists
  const uploadDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Serve uploads statically - serve the whole public folder to be safe
  app.use(express.static(path.resolve(process.cwd(), "public")));
  app.use("/uploads", express.static(uploadDir));

  // Multer config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, uniqueSuffix + ext);
    },
  });

  const upload = multer({ 
    storage,
    limits: {
      fileSize: 500 * 1024 * 1024, // 500MB per file
      files: 500 // Up to 500 files at once
    }
  });

  // API Routes
  app.get("/api/gallery", async (req, res) => {
    try {
      if (firestore) {
        const snapshot = await firestore.collection("gallery").orderBy("created_at", "desc").get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.json(items);
      }
      const items = db.prepare("SELECT * FROM gallery ORDER BY created_at DESC").all();
      res.json(items);
    } catch (err) {
      console.error("Failed to fetch gallery:", err);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.post("/api/upload", upload.array("images"), async (req, res) => {
    console.log("Upload request received. Content-Type:", req.headers['content-type']);
    
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        console.log("No files found in request body");
        return res.status(400).json({ error: "No files uploaded" });
      }
      
      const { title, year } = req.body;
      console.log(`Processing ${files.length} files. Title: ${title}, Year: ${year}`);
      
      const results: any[] = [];
      
      if (firestore && bucket) {
        // Firebase Upload
        for (const file of files) {
          const blob = bucket.file(`gallery/${Date.now()}-${file.originalname}`);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
            resumable: false
          });

          await new Promise((resolve, reject) => {
            blobStream.on('error', reject);
            blobStream.on('finish', resolve);
            blobStream.end(file.buffer || fs.readFileSync(file.path));
          });

          // Make public
          await blob.makePublic();
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          
          const finalTitle = title || "새로운 활동 사진";
          const finalYear = year || `${new Date().getFullYear()}년`;
          
          const docRef = await firestore.collection("gallery").add({
            title: finalTitle,
            image: imageUrl,
            year: finalYear,
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });

          results.push({ 
            id: docRef.id, 
            title: finalTitle, 
            image: imageUrl, 
            year: finalYear 
          });

          // Clean up local file if it exists
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
        return res.json(results);
      }

      // SQLite Fallback
      try {
        const insert = db.prepare("INSERT INTO gallery (title, image, year) VALUES (?, ?, ?)");
        
        const transaction = db.transaction((filesToInsert) => {
          for (const file of filesToInsert) {
            const imageUrl = `/uploads/${file.filename}`;
            const finalTitle = title || "새로운 활동 사진";
            const finalYear = year || `${new Date().getFullYear()}년`;
            
            const result = insert.run(finalTitle, imageUrl, finalYear);
            results.push({ 
              id: result.lastInsertRowid, 
              title: finalTitle, 
              image: imageUrl, 
              year: finalYear 
            });
          }
        });

        transaction(files);
        console.log("Upload and DB insert successful");
        res.json(results);
      } catch (dbErr) {
        console.error("Database error during upload:", dbErr);
        res.status(500).json({ error: "Database error during upload" });
      }
    } catch (criticalErr) {
      console.error("Critical upload error:", criticalErr);
      res.status(500).json({ error: "Critical server error during upload" });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Attempting to delete item with id: ${id}`);

      if (firestore) {
        await firestore.collection("gallery").doc(id).delete();
        return res.json({ success: true });
      }

      const numericId = parseInt(id, 10);
      const result = db.prepare("DELETE FROM gallery WHERE id = ?").run(numericId);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Internal server error during deletion" });
    }
  });

  app.put("/api/gallery/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, year } = req.body;
      console.log(`Update request for ID: ${id}, Title: ${title}, Year: ${year}`);
      
      if (firestore) {
        await firestore.collection("gallery").doc(id).update({ title, year });
        return res.json({ success: true });
      }

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const result = db.prepare("UPDATE gallery SET title = ?, year = ? WHERE id = ?").run(title, year, numericId);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ error: "Internal server error during update" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    // Simple password check for demo purposes
    if (password === "1024") {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from public
    app.use(express.static(path.join(__dirname, "public")));
    
    // Serve static files from dist in production
    app.use(express.static(path.join(__dirname, "dist")));
    
    // Serve src folder for legacy image paths in production
    app.use("/src", express.static(path.join(__dirname, "src")));
    
    // Handle SPA routing in production
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler caught:", err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        error: `업로드 오류: ${err.message}`,
        code: err.code
      });
    }
    res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
