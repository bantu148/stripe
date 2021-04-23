const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51Ij2RFSJiOJ37iyWn9BCaT3NhTVYmKNPaAcdedCL95lV08OncPFhTxdEFDoPiyKIyM4iH94iF0Pw918u2WcOYL0C00CVgQscRV"
);
const uuid = require("uuid");
const app = express();

app.use(express.json());
app.use(cors());

//routes
app.get("/", (req, res) => {
  res.send("It works");
});

app.post("/payment", (req, res) => {
  const { product, token } = req.body;
  console.log("product", product);
  console.log("price", product.price);
  const idempotencyKey = uuid();

  return stripe.cusotomers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.price * 100,
          currency: "usd",
          customer: customer.id,
          receipt_email: token.email,
          description: product.name,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address_country,
            },
          },
        },
        { idempotencyKey }
      );
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});
//listen
app.listen(3000, () => console.log("server is up and running"));
