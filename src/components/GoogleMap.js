export default function GoogleMap() {
  const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL || 
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0!2d72.8!3d19.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAwJzAwLjAiTiA3MsKwNDgnMDAuMCJF!5e0!3m2!1sen!4v1234567890';

  return (
    <div className="google-map-container">
      <iframe
        src={mapUrl}
        width="100%"
        height="400"
        style={{ border: 0, borderRadius: '16px' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="The Glassy Touch Store Location"
      ></iframe>
    </div>
  );
}
