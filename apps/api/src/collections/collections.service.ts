import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectionsService {
  constructor() {}

  async getCollections(query: any) {
    // In a real app, these would be driven by database tables.
    // We mock the structure here based on the requirement:
    // "Offers, Top 10, Food on train, Plan a party, and Collections (showing previously ordered)"
    
    return {
      offers: [
        { id: 1, title: '50% Off First Order', code: 'WELCOME50', image: '/images/offers/1.png' },
        { id: 2, title: 'Free Dessert with Tiffin', code: 'SWEETTREAT', image: '/images/offers/2.png' }
      ],
      top10: [
        { id: 1, name: 'Ramkrishna Nagar Branch', rating: 4.9, type: 'branch' },
        { id: 2, name: 'Kankarbagh Branch', rating: 4.8, type: 'branch' },
        { id: 3, name: 'Butter Chicken', rating: 4.9, type: 'dish' },
        { id: 4, name: 'Paneer Tikka', rating: 4.8, type: 'dish' }
      ],
      foodOnTrain: [
        { id: 1, name: 'Patna Junction Delivery', type: 'service', deliveryTime: '30 mins' }
      ],
      planAParty: [
        { id: 1, name: 'Bulk Order Menu', type: 'menu' },
        { id: 2, name: 'Catering Enquiry', type: 'form' }
      ],
      previouslyOrdered: [
        { id: 'item-2', name: 'Butter Chicken', type: 'dish', lastOrder: '2 days ago' },
        { id: 'branch-1', name: 'Ramkrishna Nagar Branch', type: 'branch', lastOrder: '1 week ago' }
      ]
    };
  }
}
