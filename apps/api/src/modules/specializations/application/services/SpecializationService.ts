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

  // METHOD TO FETCH UPDATE SPECIALIZATION BASED ON ID
  async update(id: string, data: Partial<ISpecialization>) {
    const spec = await SpecializationModel.findByIdAndUpdate(id, data, {
      returnDocument: "after", // return data after update
      runValidators: true, // validate the new data
    });

    if (!spec) {
      throw new AppError("No specialization found with that ID", 404);
    }
    return spec;
  }
}

export const specializationService = new SpecializationService();
