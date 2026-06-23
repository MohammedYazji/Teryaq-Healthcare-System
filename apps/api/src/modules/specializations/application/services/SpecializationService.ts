import { AppError } from "../../../../core/errors/AppError";
import { ISpecialization } from "../../domain/entities/ISpecialization";
import { SpecializationModel } from "../../infrastructure/models/SpecializationModel";
import { DoctorProfileModel } from "../../../doctors/infrastructure/models/DoctorModel";

class SpecializationService {
  // METHOD TO CREATE  A NEW SPECIALIZATION
  async create(data: Partial<ISpecialization>) {
    return await SpecializationModel.create(data);
  }

  // METHOD TO FETCH ALL THE SPECIALIZATIONS DATA (SORTED) WITH DOCTOR COUNTS
  async findAll() {
    const specializations = await SpecializationModel.find().sort("name").lean();
    const specsWithCounts = await Promise.all(
      specializations.map(async (spec) => ({
        ...spec,
        doctorCount: await DoctorProfileModel.countDocuments({ specialization: spec._id }),
      })),
    );
    return specsWithCounts;
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

  // METHOD TO DELETE SPECIALIZATION BASED ON ID (SOFT DELETE)
  async delete(id: string) {
    const spec = await SpecializationModel.findByIdAndUpdate(
      id,
      {
        active: false,
      },
      { returnDocument: "after" },
    );

    if (!spec) {
      throw new AppError("No specialization found with that ID", 404);
    }
  }
}

export const specializationService = new SpecializationService();
