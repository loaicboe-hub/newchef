import prisma from '../config/prisma';

export interface AddressInput {
  title?: string;
  city?: string;
  area: string;
  street: string;
  buildingNo?: string;
  floorNo?: string;
  apartmentNo?: string;
  notes?: string;
  isDefault?: boolean;
}

export class AddressService {
  async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(userId: string, data: AddressInput) {
    if (!data.area || !data.street) {
      throw new Error('يرجى تحديد المنطقة والشارع');
    }

    // If setting as default, remove default from others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        title: data.title || 'المنزل',
        city: data.city || 'الجيزة',
        area: data.area,
        street: data.street,
        buildingNo: data.buildingNo,
        floorNo: data.floorNo,
        apartmentNo: data.apartmentNo,
        notes: data.notes,
        isDefault: data.isDefault || false,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new Error('العنوان غير موجود');
    }

    return prisma.address.delete({
      where: { id: addressId },
    });
  }
}

export const addressService = new AddressService();
