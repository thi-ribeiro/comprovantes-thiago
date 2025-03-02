ALTER TABLE `rnthiago`.`comprovantes` 
ADD COLUMN `cartaoComprovante` VARCHAR(45) NULL DEFAULT NULL AFTER `valorComprovante`,
ADD COLUMN `horarioPostComprovante` VARCHAR(45) NULL DEFAULT NULL AFTER `cartaoComprovante`;
