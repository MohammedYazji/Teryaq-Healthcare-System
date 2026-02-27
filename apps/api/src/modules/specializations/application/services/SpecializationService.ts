import { AppError } from "../../../../core/errors/AppError";
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

  // METHOD TO FETCH A SPECIALIZATION BASED ON ID
  async findById(id: string) {
    const specialization = await SpecializationModel.findById(id);

    if (!specialization) {
      throw new AppError("No specialization found with that ID", 404);
    }

    return specialization;
  }
}

export const specializationService = new SpecializationService();
