-- Ajouter le champ manufacturer pour le fabricant du chipset (NVIDIA, AMD, Intel)
-- brand = marque de la carte (MSI, ASUS, Gigabyte, etc.)
-- manufacturer = fabricant du chipset (NVIDIA, AMD, Intel)

ALTER TABLE public.hardware_models
ADD COLUMN manufacturer text;

-- Ajouter un commentaire pour documenter la distinction
COMMENT ON COLUMN public.hardware_models.brand IS 'Marque de la carte/produit (MSI, ASUS, Gigabyte, etc.)';
COMMENT ON COLUMN public.hardware_models.manufacturer IS 'Fabricant du chipset/processeur (NVIDIA, AMD, Intel)';