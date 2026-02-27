import { ISpecialization } from "../../domain/entities/ISpecialization";
import { SpecializationModel } from "../../infrastructure/models/SpecializationModel";

class SpecializationService {
  // METHOD TO CREATE  A NEW SPECIALIZATION
  async create(data: Partial<ISpecialization>) {
    return await SpecializationModel.create(data);
  }

  // METHOD TO FETCH ALL THE SPECIALIZATIONS DATA (SORTED)
  async findAll() {
    return await SpecializationModel.find().sort("name");
  }
}

export const specializationService = new SpecializationService();
