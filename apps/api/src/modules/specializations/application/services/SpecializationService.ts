import { ISpecialization } from "../../domain/entities/ISpecialization";
import { SpecializationModel } from "../../infrastructure/models/SpecializationModel";

class SpecializationService {
  // METHOD TO CREATE  A NEW SPECIALIZATION
  async create(data: Partial<ISpecialization>) {
    return await SpecializationModel.create(data);
  }
}

export const specializationService = new SpecializationService();
