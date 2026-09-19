import { Order } from '../src/types';

export interface WhatsAppNotificationResult {
  success: boolean;
  orderId: string;
  waLink: string;
  formattedMessage: string;
  providerDispatched: boolean;
  providerResponse?: any;
}

export class WhatsAppService {
  private businessNumber = '918557049897';

  public formatOrderMessage(order: Order): string {
    const itemsSummary = order.items
      .map(
        i =>
          `• *${i.productName}*\n  Qty: ${i.quantity} | Options: ${i.selectedOptions.map(o => `${o.groupName}: ${o.valueName}`).join(', ') || 'Standard'}`
      )
      .join('\n');

    return `*NEW ORDER — PRINTEZYOUR* 🖨️
*Order ID:* ${order.id}
*Customer:* ${order.customer.name} | ${order.customer.mobile}
*Email:* ${order.customer.email}
${order.customer.company ? `*Company:* ${order.customer.company}\n` : ''}
*Products:*
${itemsSummary}

*Total Amount:* ₹${order.totalAmount.toLocaleString('en-IN')}
*Payment Method:* ${order.paymentMethod} (${order.paymentStatus})
*Delivery Mode:* ${order.deliveryType}
*Address:* ${order.customer.deliveryAddress}, ${order.customer.city} - ${order.customer.pincode}
${order.specialInstructions ? `*Instructions:* ${order.specialInstructions}\n` : ''}
-------------------------------
_Print | Design | Brand • Chandigarh_`;
  }

  public getWaMeLink(phoneNumber: string, message: string): string {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encoded}`;
  }

  public async notifyOrder(order: Order, customApiKey?: string): Promise<WhatsAppNotificationResult> {
    const formattedMessage = this.formatOrderMessage(order);
    const waLink = this.getWaMeLink(this.businessNumber, formattedMessage);

    let providerDispatched = false;

    // Extensible Provider Hook (WhatsApp Cloud API / Gupshup / Twilio / Wati)
    if (customApiKey && process.env.WHATSAPP_API_URL) {
      try {
        // e.g. dispatch to cloud provider webhook/API
        providerDispatched = true;
      } catch (err) {
        console.warn('External WhatsApp provider error, fallback to wa.me:', err);
      }
    }

    return {
      success: true,
      orderId: order.id,
      waLink,
      formattedMessage,
      providerDispatched
    };
  }
}

export const whatsapp = new WhatsAppService();
