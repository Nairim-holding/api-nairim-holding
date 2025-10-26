import { Request, Response } from "express";
import {
  createPropertys,
  deletePropertys,
  getPropertyById,
  getPropertys,
  updatePropertys,
} from "../models/property";
import { Prisma } from "@prisma/client";
import prisma from "../../prisma/client";
import fs from "fs";
import path from "path";

export class PropertyController {
  static async getProperty(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const includeInactive = req.query.includeInactive === "true";

    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.search;
    delete filters.includeInactive;

    const sortOptions: Record<string, string> = {};
    const realFilters: Record<string, string> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (key.startsWith("sort_")) {
        sortOptions[key] = value as string;
      } else {
        realFilters[key] = value as string;
      }
    }

    try {
      const properties = await getPropertys(
        limit,
        page,
        search,
        sortOptions,
        includeInactive,
        realFilters
      );

      res.status(200).json(properties);
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getPropertyById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const agency = await getPropertyById(+id);
      res.status(200).json(agency);
    } catch (error) {
      res.status(500);
    }
  }

  static async createProperty(req: Request, res: Response): Promise<any> {
    try {
      const create = await createPropertys(req.body);
      res.status(200).json({
        status: 200,
        message: `O imóvel ${(await create).title} foi criado com sucesso!`,
        id: create.id,
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            return res.status(409).json({
              status: 409,
              message:
                "Já existe um imóvel com um dos dados únicos informados.",
            });

          case "P2003":
            return res.status(400).json({
              status: 400,
              message:
                "Referência inválida: verifique se o proprietário e o tipo de imóvel existem.",
            });

          case "P2025":
            return res.status(404).json({
              status: 404,
              message: "Recurso relacionado não encontrado.",
            });

          default:
            return res.status(400).json({
              status: 400,
              message: `Erro ao processar a solicitação (código: ${error.code}).`,
            });
        }
      }
      return res.status(500).json({
        status: 500,
        message: "Erro interno ao criar o imóvel. Tente novamente mais tarde.",
      });
    }
  }

  static async createMidias(req: Request, res: Response): Promise<any> {
    try {
      const propertyId = Number(req.params.id);
      const userId = Number(req.body.userId);
      if (!propertyId) {
        return res.status(400).json({ message: "ID do imóvel inválido" });
      }

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const files = req.files as Record<string, Express.Multer.File[]>;
      const savedDocuments = [];

      const baseUrl = process.env.BASE_URL || "http://localhost:5000/uploads";

      for (const key in files) {
        for (const file of files[key]) {
          const relativePath = path.relative(
            path.join(__dirname, "../../uploads"),
            file.path
          );

          const fileUrl = `${baseUrl}/${relativePath.replace(/\\/g, "/")}`;

          const created = await prisma.document.create({
            data: {
              property_id: propertyId,
              file_path: fileUrl,
              file_type: file.mimetype,
              description: key,
              type:
                key === "arquivosMatricula"
                  ? "REGISTRATION"
                  : key === "arquivosEscritura"
                  ? "TITLE_DEED"
                  : "OTHER",
              created_by: userId || 1,
            },
          });

          savedDocuments.push(created);
        }
      }

      return res.status(200).json({
        message: "Mídias cadastradas com sucesso!",
        documents: savedDocuments,
      });
    } catch (error) {
      console.error("Erro no upload de mídias:", error);
      return res.status(500).json({ message: "Erro ao enviar mídias" });
    }
  }

  static async updateProperty(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const updated = await updatePropertys(Number(id), req.body);
      res.status(200).json({
        status: 200,
        message: `O imovel ${updated.title} foi atualizado com sucesso!`,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar imovel" });
    }
  }

  static async updateMidias(req: Request, res: Response): Promise<any> {
    try {
      const propertyId = Number(req.params.id);
      const userId = Number(req.body.userId);

      if (!propertyId) {
        return res.status(400).json({ message: "ID do imóvel inválido" });
      }

      const files = req.files as Record<string, Express.Multer.File[]>;
      const baseUrl = process.env.BASE_URL || "http://localhost:5000/uploads";
      const uploadDir = path.join(__dirname, "../../uploads");

      const savedDocuments = [];

      const existingDocuments = await prisma.document.findMany({
        where: {
          property_id: propertyId,
        },
      });

      const existingFilePaths = new Set(
        existingDocuments.map((doc) => doc.file_path)
      );

      const newFilePaths: string[] = [];

      if (files && Object.keys(files).length > 0) {
        for (const key in files) {
          for (const file of files[key]) {
            const relativePath = path.relative(uploadDir, file.path);
            const fileUrl = `${baseUrl}/${relativePath.replace(/\\/g, "/")}`;
            newFilePaths.push(fileUrl);

            if (!existingFilePaths.has(fileUrl)) {
              const created = await prisma.document.create({
                data: {
                  property_id: propertyId,
                  file_path: fileUrl,
                  file_type: file.mimetype,
                  description: key,
                  type:
                    key === "arquivosMatricula"
                      ? "REGISTRATION"
                      : key === "arquivosEscritura"
                      ? "TITLE_DEED"
                      : "OTHER",
                  created_by: userId || 1,
                },
              });

              savedDocuments.push(created);
            }
          }
        }
      }

      const toDelete = existingDocuments.filter(
        (doc) => !newFilePaths.includes(doc.file_path)
      );

      for (const doc of toDelete) {
        await prisma.document.delete({ where: { id: doc.id } });

        const absoluteFilePath = path.join(
          uploadDir,
          doc.file_path.replace(`${baseUrl}/`, "")
        );

        if (fs.existsSync(absoluteFilePath)) {
          fs.unlinkSync(absoluteFilePath);
        }
      }

      return res.status(200).json({
        message: "Mídias atualizadas com sucesso!",
        documents: savedDocuments,
      });
    } catch (error) {
      console.error("Erro ao editar mídias:", error);
      return res.status(500).json({ message: "Erro ao editar mídias" });
    }
  }

  static async deleteProperty(req: Request, res: Response) {
    const { id } = req.params;
    const propertyById = await getPropertyById(+id);
    try {
      await deletePropertys(Number(id));
      res.status(200).json({
        status: 200,
        message: `Imovel ${propertyById?.title} foi deletado com sucesso.`,
      });
    } catch (error) {
      res.status(500).json({ error: `Erro ao deletar imovel ${error}` });
    }
  }
}
