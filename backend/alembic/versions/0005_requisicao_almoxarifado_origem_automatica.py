"""requisicao de compra: almoxarifado de destino e origem automatica
(estoque minimo)

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-18 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('requisicoes_compra', sa.Column('almoxarifado_id', sa.Integer(), nullable=True))
    op.add_column(
        'requisicoes_compra',
        sa.Column('origem_automatica', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_foreign_key(
        'fk_requisicoes_compra_almoxarifado_id', 'requisicoes_compra', 'almoxarifados', ['almoxarifado_id'], ['id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_requisicoes_compra_almoxarifado_id', 'requisicoes_compra', type_='foreignkey')
    op.drop_column('requisicoes_compra', 'origem_automatica')
    op.drop_column('requisicoes_compra', 'almoxarifado_id')
