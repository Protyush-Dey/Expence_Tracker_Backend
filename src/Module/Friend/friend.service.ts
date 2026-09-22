import { ApiError } from "../../utils/ApiError";
import { prisma } from "../../config/prisma";

export class FriendService {
  // make request
  async makeRequest(userId: string, requestTo: string) {
    if (requestTo === userId)
      throw new ApiError(400, "Cannot send request to yourself");

    const target = await prisma.user.findUnique({
      where: { id: requestTo },
    });
    if (!target) throw new ApiError(404, "User not found");

    const areFriends = await prisma.friend.findFirst({
      where: {
        OR: [
          { userAId: userId, userBId: requestTo },
          { userAId: requestTo, userBId: userId },
        ],
      },
    });
    if (areFriends) throw new ApiError(409, "Already friends");

    const alreadyExists = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { requestFromId: userId, requestToId: requestTo },
          { requestFromId: requestTo, requestToId: userId },
        ],
      },
    });
    if (alreadyExists) throw new ApiError(409, "Friend request already exists");

    return prisma.friendRequest.create({
      data: {
        requestFromId: userId,
        requestToId: requestTo,
      },
    });
  }

  // reject request
  async rejectRequest(userId: string, requestId: string) {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new ApiError(404, "Request not found");
    this.assertOwnership(request.requestToId, userId);
    await prisma.friendRequest.delete({
      where: { id: requestId },
    });
  }

  // delete request
  async deleteRequest(userId: string, requestId: string) {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new ApiError(404, "Request not found");
    // Only the sender can delete their own request
    this.assertOwnership(request.requestFromId, userId);
    await prisma.friendRequest.delete({
      where: { id: requestId },
    });
  }

  // get all friend Received request
  async getAllRequestsReceived(userId: string) {
    const requests = await prisma.friendRequest.findMany({
      where: { requestToId: userId },
      include: {
        requestFrom: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => ({
      _id: r.id,
      id: r.id,
      createdAt: r.createdAt,
      senderName: r.requestFrom.userName,
      senderFullName: r.requestFrom.fullName,
      senderEmail: r.requestFrom.email,
    }));
  }

  // get all friend sent request
  async getAllRequestsSent(userId: string) {
    const requests = await prisma.friendRequest.findMany({
      where: { requestFromId: userId },
      include: {
        requestTo: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests.map((r) => ({
      _id: r.id,
      id: r.id,
      createdAt: r.createdAt,
      receiverName: r.requestTo.userName,
      receiverEmail: r.requestTo.email,
      receiverFullName: r.requestTo.fullName,
    }));
  }

  // accept request
  async acceptRequest(userId: string, requestId: string) {
    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new ApiError(404, "Request not found");
    // Only the recipient can accept
    this.assertOwnership(request.requestToId, userId);

    const [userAId, userBId] = [userId, request.requestFromId].sort();

    const friend = await prisma.$transaction(async (tx) => {
      const created = await tx.friend.create({
        data: {
          userAId,
          userBId,
        },
      });

      await tx.friendRequest.delete({
        where: { id: requestId },
      });

      return created;
    });

    return friend;
  }

  // get all friends
  async getAllFriends(userId: string) {
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: {
            id: true,
            email: true,
            userName: true,
            fullName: true,
          },
        },
        userB: {
          select: {
            id: true,
            email: true,
            userName: true,
            fullName: true,
          },
        },
      },
    });

    return friendships.map((f) => {
      const friend = f.userAId === userId ? f.userB : f.userA;
      return {
        _id: friend.id,
        id: friend.id,
        email: friend.email,
        userName: friend.userName,
        fullName: friend.fullName,
      };
    });
  }

  private assertOwnership(ownerId: string, resourceOwnerId: string): void {
    if (String(ownerId) !== String(resourceOwnerId)) {
      throw new ApiError(403, "Access denied");
    }
  }
}