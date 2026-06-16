using System.Text;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;

public sealed class DiscordSignatureVerifier
{
    private static readonly TimeSpan TimestampTolerance = TimeSpan.FromMinutes(5);

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

        if (!IsFreshTimestamp(timestamp))
            return false;

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

    private static bool IsFreshTimestamp(string timestamp)
    {
        if (!long.TryParse(timestamp, out var seconds))
            return false;

        try
        {
            var signedAt = DateTimeOffset.FromUnixTimeSeconds(seconds);
            return (DateTimeOffset.UtcNow - signedAt).Duration() <= TimestampTolerance;
        }
        catch
        {
            return false;
        }
    }
}
