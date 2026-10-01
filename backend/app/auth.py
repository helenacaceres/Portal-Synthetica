import hashlib
import secrets

_ITERACOES = 200_000


def gerar_hash_senha(senha: str) -> str:
    sal = secrets.token_hex(16)
    derivado = hashlib.pbkdf2_hmac("sha256", senha.encode(), sal.encode(), _ITERACOES)
    return f"{sal}${derivado.hex()}"


def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    try:
        sal, derivado_hex = hash_armazenado.split("$")
    except ValueError:
        return False
    derivado = hashlib.pbkdf2_hmac("sha256", senha.encode(), sal.encode(), _ITERACOES)
    return secrets.compare_digest(derivado.hex(), derivado_hex)


def gerar_token() -> str:
    return secrets.token_urlsafe(32)
