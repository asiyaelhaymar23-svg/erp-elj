-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRATEUR', 'RESPONSABLE', 'PREPARATEUR', 'MAGASIN', 'MAINTENANCE', 'DIRECTION');

-- CreateEnum
CREATE TYPE "Criticite" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "StatutStock" AS ENUM ('NORMAL', 'CRITIQUE', 'RUPTURE', 'SURSTOCK');

-- CreateEnum
CREATE TYPE "NatureBudget" AS ENUM ('CAPEX', 'OPEX', 'PRESTATION');

-- CreateEnum
CREATE TYPE "TypeDepense" AS ENUM ('PRESTATION', 'PDR');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('PDF', 'IMAGE', 'EXCEL', 'WORD', 'SCHEMA', 'NOTICE', 'RAPPORT', 'PHOTO');

-- CreateEnum
CREATE TYPE "ActionAudit" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "StatutMouvement" AS ENUM ('EN_ATTENTE', 'PARTIEL', 'RETOURNE', 'EN_RETARD');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "notation" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "parametres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipements" (
    "id" SERIAL NOT NULL,
    "codeSap" TEXT,
    "designation" TEXT NOT NULL,
    "constructeur" TEXT,
    "marque" TEXT,
    "modele" TEXT,
    "numeroSerie" TEXT,
    "secteur" TEXT NOT NULL,
    "sousSecteur" TEXT,
    "emplacement" TEXT,
    "puissance" TEXT,
    "tension" TEXT,
    "courant" TEXT,
    "annee" INTEGER,
    "dateInstallation" TIMESTAMP(3),
    "dateDerniereIntervention" TIMESTAMP(3),
    "dateProchaineMaintenance" TIMESTAMP(3),
    "criticite" "Criticite" NOT NULL DEFAULT 'C',
    "commentaires" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles_pdr" (
    "id" SERIAL NOT NULL,
    "codeSap" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "marque" TEXT,
    "fabricant" TEXT,
    "referenceConstructeur" TEXT,
    "famille" TEXT,
    "sousFamille" TEXT,
    "unite" TEXT,
    "magasin" TEXT,
    "stockMin" INTEGER NOT NULL DEFAULT 0,
    "stockMax" INTEGER NOT NULL DEFAULT 0,
    "stockActuel" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(12,2),
    "classeAbc" "Criticite",
    "critique" BOOLEAN NOT NULL DEFAULT false,
    "statut" "StatutStock" NOT NULL DEFAULT 'NORMAL',
    "fournisseurId" INTEGER,
    "equipementId" INTEGER,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pdr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes_achat" (
    "id" SERIAL NOT NULL,
    "numeroDa" TEXT NOT NULL,
    "division" TEXT,
    "demandeur" TEXT,
    "articleId" INTEGER,
    "quantite" INTEGER NOT NULL,
    "dateCreation" TIMESTAMP(3) NOT NULL,
    "dateValidation" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'N',
    "priorite" TEXT,
    "nature" "NatureBudget" NOT NULL DEFAULT 'OPEX',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes" (
    "id" SERIAL NOT NULL,
    "numeroBc" TEXT NOT NULL,
    "demandeAchatId" INTEGER,
    "fournisseurId" INTEGER,
    "montant" DECIMAL(14,2),
    "dateCommande" TIMESTAMP(3) NOT NULL,
    "dateReception" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'EN_COURS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrees" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER,
    "equipementId" INTEGER,
    "quantite" INTEGER NOT NULL,
    "dateEntree" TIMESTAMP(3) NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "fournisseurId" INTEGER,
    "otNumero" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorties" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER,
    "equipementId" INTEGER,
    "quantite" INTEGER NOT NULL,
    "dateSortie" TIMESTAMP(3) NOT NULL,
    "dateRetourPrevue" TIMESTAMP(3),
    "dateRetourReelle" TIMESTAMP(3),
    "utilisateurId" INTEGER NOT NULL,
    "destination" TEXT,
    "fournisseurId" INTEGER,
    "otNumero" TEXT,
    "statut" "StatutMouvement" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sorties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" SERIAL NOT NULL,
    "equipementId" INTEGER NOT NULL,
    "dateIntervention" TIMESTAMP(3) NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "technicien" TEXT,
    "cout" DECIMAL(12,2),
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depenses" (
    "id" SERIAL NOT NULL,
    "secteur" TEXT NOT NULL,
    "nature" "NatureBudget" NOT NULL,
    "type" "TypeDepense" NOT NULL,
    "articleId" INTEGER,
    "montant" DECIMAL(14,2) NOT NULL,
    "pilote" TEXT,
    "otNumero" TEXT,
    "fournisseurId" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'PREVU',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "fichierUrl" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historique" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "action" "ActionAudit" NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "ancienneValeur" JSONB,
    "nouvelleValeur" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "parametres_type_idx" ON "parametres"("type");

-- CreateIndex
CREATE UNIQUE INDEX "parametres_type_valeur_key" ON "parametres"("type", "valeur");

-- CreateIndex
CREATE UNIQUE INDEX "equipements_codeSap_key" ON "equipements"("codeSap");

-- CreateIndex
CREATE INDEX "equipements_secteur_idx" ON "equipements"("secteur");

-- CreateIndex
CREATE INDEX "equipements_criticite_idx" ON "equipements"("criticite");

-- CreateIndex
CREATE UNIQUE INDEX "articles_pdr_codeSap_key" ON "articles_pdr"("codeSap");

-- CreateIndex
CREATE INDEX "articles_pdr_statut_idx" ON "articles_pdr"("statut");

-- CreateIndex
CREATE INDEX "articles_pdr_classeAbc_idx" ON "articles_pdr"("classeAbc");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_achat_numeroDa_key" ON "demandes_achat"("numeroDa");

-- CreateIndex
CREATE INDEX "demandes_achat_statut_idx" ON "demandes_achat"("statut");

-- CreateIndex
CREATE INDEX "demandes_achat_division_idx" ON "demandes_achat"("division");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_numeroBc_key" ON "commandes"("numeroBc");

-- CreateIndex
CREATE INDEX "commandes_statut_idx" ON "commandes"("statut");

-- CreateIndex
CREATE INDEX "sorties_statut_idx" ON "sorties"("statut");

-- CreateIndex
CREATE INDEX "depenses_secteur_idx" ON "depenses"("secteur");

-- CreateIndex
CREATE INDEX "documents_entityType_entityId_idx" ON "documents"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_utilisateurId_isRead_idx" ON "notifications"("utilisateurId", "isRead");

-- CreateIndex
CREATE INDEX "historique_tableName_recordId_idx" ON "historique"("tableName", "recordId");

-- AddForeignKey
ALTER TABLE "articles_pdr" ADD CONSTRAINT "articles_pdr_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles_pdr" ADD CONSTRAINT "articles_pdr_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_achat" ADD CONSTRAINT "demandes_achat_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles_pdr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_demandeAchatId_fkey" FOREIGN KEY ("demandeAchatId") REFERENCES "demandes_achat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes" ADD CONSTRAINT "commandes_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrees" ADD CONSTRAINT "entrees_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles_pdr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrees" ADD CONSTRAINT "entrees_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrees" ADD CONSTRAINT "entrees_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrees" ADD CONSTRAINT "entrees_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorties" ADD CONSTRAINT "sorties_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles_pdr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorties" ADD CONSTRAINT "sorties_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorties" ADD CONSTRAINT "sorties_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorties" ADD CONSTRAINT "sorties_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_equipementId_fkey" FOREIGN KEY ("equipementId") REFERENCES "equipements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles_pdr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_equipement_fkey" FOREIGN KEY ("entityId") REFERENCES "equipements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historique" ADD CONSTRAINT "historique_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
