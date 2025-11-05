// root/utils/kafkaProducer.js
const producer = { 
    /**
     * Sends a message to a Kafka topic (simulated).
     * @param {string} topic - The Kafka topic name.
     * @param {object} message - The message payload to send.
     */
    send: (topic, message) => {
        const timestamp = new Date().toISOString();
        console.log(`\n[KAFKA SIMULATOR - ${timestamp}]`);
        console.log(`PRODUCING to topic: ${topic}`);
        console.log("PAYLOAD:", JSON.stringify(message, null, 2));
        console.log('------------------------------------------');
        // In a real system, the connection and send logic would go here.
    }
};

module.exports = producer;