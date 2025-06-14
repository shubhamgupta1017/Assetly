const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


async function sendOverdueMail(transaction, issuerEmail, ownerEmail, itemName, issuerName) {
  console.log(`📨 Sending email for item "${itemName}" to ${issuerEmail} and ${ownerEmail}`);

    const mailOptions = {
    from: process.env.GMAIL_USER,
    to: [issuerEmail, ownerEmail],
    subject: `Overdue Item: ${itemName}`,
    text: `The item "${itemName}" is overdue by "${issuerName}".\nReturn Date: ${transaction.returnDate.toDateString()}\nVisit https://assetly-umber.vercel.app/item/${transaction.itemUID} for more details.`,
    };

  await transporter.sendMail(mailOptions);
}

async function sendRequestMail(transaction, issuerId) {
  try {
    if (!transaction) throw new Error('Transaction not found');

    const item = await Item.findById(transaction.itemUID);
    if (!item) throw new Error('Item not found');

    const issuer = await User.findById(issuerId);
    const owner = await User.findById(transaction.ownerId);

    if (!issuer || !owner) throw new Error('User(s) not found');

    const itemLink = `https://assetly-umber.vercel.app/item/${transaction.itemUID}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: owner.email,
      cc: issuer.email,
      subject: `Request for "${item.itemName}"`,
      html: `
        <p>Hello ${owner.name || 'Owner'},</p>
        <p><strong>${issuer.name || 'A user'}</strong> has requested the item <strong>"${item.itemName}"</strong>.</p>
        <p>Click <a href="${itemLink}">here</a> to view the item or respond to the request.</p>
        <hr>
        <p style="font-size:12px;color:gray;">This email was triggered by a new transaction request on Assetly.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Request email sent to owner`);

  } catch (error) {
    console.error('Error sending request mail:', error.message);
  }
}

async function sendRejectionMail(transaction, issuerId) {
  try {
    if (!transaction) throw new Error('Transaction not found');

    const item = await Item.findById(transaction.itemUID);
    if (!item) throw new Error('Item not found');

    const issuer = await User.findById(issuerId);
    if (!issuer) throw new Error('Issuer not found');


    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: issuer.email, // Only issuer
      subject: `Request Rejected: "${item.itemName}"`,
      html: `
        <p>Hello ${issuer.name || 'User'},</p>
        <p>Your request for the item <strong>"${item.itemName}"</strong> has been <strong>rejected</strong> by the owner.</p>
        <hr>
        <p style="font-size:12px;color:gray;">This email was triggered by an update on your request on Assetly.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to issuer`);

  } catch (error) {
    console.error('Error sending rejection mail:', error.message);
  }
}

async function sendRejectionMail(transaction) {
  try {
    if (!transaction) throw new Error('Transaction not found');

    const item = await Item.findById(transaction.itemUID);
    if (!item) throw new Error('Item not found');

    const issuer = await User.findById(transaction.issuerId);
    const owner = await User.findById(transaction.ownerId);

    if (!issuer || !owner) throw new Error('User(s) not found');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: issuer.email, // Only issuer
      subject: `Request Rejected: "${item.itemName}"`,
      html: `
        <p>Hello ${issuer.name || 'User'},</p>
        <p>Your request for the item <strong>"${item.itemName}"</strong> has been <strong>rejected</strong> by <strong>${owner.name || 'the owner'}</strong>.</p>
        <hr>
        <p style="font-size:12px;color:gray;">This email was triggered by an update on your request on Assetly.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to issuer`);

  } catch (error) {
    console.error('Error sending rejection mail:', error.message);
  }
}


async function sendApprovalMail(transaction) {
  try {
    if (!transaction) throw new Error('Transaction not found');

    const item = await Item.findById(transaction.itemUID);
    if (!item) throw new Error('Item not found');

    const issuer = await User.findById(transaction.issuerId);
    const owner = await User.findById(transaction.ownerId);

    if (!issuer || !owner) throw new Error('User(s) not found');

    const itemLink = `https://assetly-umber.vercel.app/item/${transaction.itemUID}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: issuer.email, // Only issuer
      subject: `Request Approved: "${item.itemName}"`,
      html: `
        <p>Hello ${issuer.name || 'User'},</p>
        <p>Your request for the item <strong>"${item.itemName}"</strong> has been <strong>approved</strong> by <strong>${owner.name || 'the owner'}</strong>.</p>
        <p>You can view the item or proceed with the transaction <a href="${itemLink}">here</a>.</p>
        <hr>
        <p style="font-size:12px;color:gray;">This email was triggered by an update on your request on Assetly.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to issuer`);

  } catch (error) {
    console.error('Error sending approval mail:', error.message);
  }
}

function getTodayISTMidnight() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const year = istNow.getUTCFullYear();
  const month = istNow.getUTCMonth(); // 0-indexed
  const date = istNow.getUTCDate();
  const midnightIST = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  return midnightIST;
}

cron.schedule('50 21 * * *', async () => {
  try {
    const today = getTodayISTMidnight();

    const overdueTransactions = await Transaction.find({
    returnDate: { $lt: today },
    currentStatus: { $in: ['Issued', 'Overdue'] }
    });

    console.log(overdueTransactions.length, 'overdue transactions found');
    for (const txn of overdueTransactions) {
      const item = await Item.findById(txn.itemUID);
      const itemName = item ? item.itemName : 'Unknown Item';

      const issuerUser = await User.findById(txn.issuerId);
      const ownerUser = await User.findById(txn.ownerId);
      if (!issuerUser || !ownerUser) {
        console.warn(`Skipping transaction: Could not find user(s) for item "${itemName}"`);
        continue;
      }

      const issuerEmail = issuerUser.email;
      const ownerEmail = ownerUser.email;
      const issuerName = issuerUser.name 
      await sendOverdueMail(txn, issuerEmail, ownerEmail, itemName, issuerName);

      txn.currentStatus = 'Overdue';

      await txn.save();
      console.log(`Transaction marked as Overdue and saved for "${itemName}"`);
    }

    console.log(`[CRON COMPLETE] Processed ${overdueTransactions.length} transaction(s) at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Error in overdue checker:', error);
  }
}, {
  timezone: 'UTC' 
});

module.exports = {
  sendRequestMail,
  sendRejectionMail,
  sendApprovalMail,
};
