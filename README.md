# rock-paper-scissor

backend link: https://rock-paper-scissor-e4cm.onrender.com

## Postman Test 
### GET on `/health`
```js
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Successful GET request", function () {
    pm.expect(pm.response.code).to.be.equal(200);
});

pm.test("Your test name", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("UP");
});
```

### GET on `/users`
```js
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

var schema = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "_id": {
                "type": "string"
            },
            "name": {
                "type": "string"
            },
            "win": {
                "type": "number"
            },
            "loss": {
                "type": "number"
            },
        }
    } 
    
};

pm.test('Schema is valid', function () {
    var jsonData = pm.response.json();

    pm.expect(tv4.validate(jsonData, schema)).to.be.true;
});
```
