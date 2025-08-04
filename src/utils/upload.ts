import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const propertyId = req.params.id;

    let folder = "outros";
    if (file.fieldname === "arquivosImagens") folder = "imagens";
    else if (file.fieldname === "arquivosMatricula") folder = "matricula";
    else if (file.fieldname === "arquivosEscritura") folder = "escritura";

    const dir = path.join(__dirname, "../../uploads", propertyId, folder);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });
