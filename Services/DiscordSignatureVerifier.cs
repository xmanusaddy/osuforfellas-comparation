using System.Text;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;

public sealed class DiscordSignatureVerifier
{
    private readonly IConfiguration _config;

    public DiscordSignatureVerifier(IConfiguration config)
    {
        _config = config;
    }

    public bool Verify(string timestamp, string body, string signature)
    {
        var publicKeyHex = _config["Discord:PublicKey"];
        if (string.IsNullOrWhiteSpace(publicKeyHex)
            || string.IsNullOrWhiteSpace(timestamp)
            || string.IsNullOrWhiteSpace(body)
            || string.IsNullOrWhiteSpace(signature))
        {
            return false;
        }

        try
        {
            var publicKey = Convert.FromHexString(publicKeyHex.Trim());
            var signatureBytes = Convert.FromHexString(signature.Trim());
            var message = Encoding.UTF8.GetBytes(timestamp + body);

            var verifier = new Ed25519Signer();
            verifier.Init(false, new Ed25519PublicKeyParameters(publicKey, 0));
            verifier.BlockUpdate(message, 0, message.Length);

            return verifier.VerifySignature(signatureBytes);
        }
        catch
        {
            return false;
        }
    }
}
